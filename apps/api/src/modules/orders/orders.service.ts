import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PrintService } from '../print/print.service';
import { ORDER_STATUS_TRANSITIONS, type OrderStatus } from '@dannyshoes/shared';
import type { CreateOrderDto } from './dto/create-order.dto';
import type { AuthUser } from '@dannyshoes/shared';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private printService: PrintService,
  ) {}

  async create(dto: CreateOrderDto, user: AuthUser) {
    const requestingStoreId = user.storeId;
    if (!requestingStoreId) throw new BadRequestException('Usuario sin local asignado');

    // Verificar stock disponible y reservar atómicamente
    for (const item of dto.items) {
      const stock = await this.prisma.stock.findUnique({
        where: { skuId_storeId: { skuId: item.skuId, storeId: dto.fulfillingStoreId } },
        include: { location: true, sku: { include: { product: true } } },
      });

      if (!stock || (stock.quantity - stock.reservedQuantity) < item.quantity) {
        throw new BadRequestException(
          `Sin stock suficiente para SKU ${item.skuId} en la bodega seleccionada`,
        );
      }
    }

    // Transacción: crear orden + reservar stock + crear print job
    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.interStoreOrder.create({
        data: {
          tenantId: user.tenantId,
          requestingStoreId,
          fulfillingStoreId: dto.fulfillingStoreId,
          createdById: user.id,
          notes: dto.notes,
          items: {
            create: dto.items.map((item) => ({
              skuId: item.skuId,
              quantityRequested: item.quantity,
            })),
          },
        },
        include: {
          items: { include: { sku: { include: { product: true } }, location: true } },
          requestingStore: true,
          fulfillingStore: true,
          createdBy: { select: { firstName: true, lastName: true } },
        },
      });

      // Reservar stock atómico por cada ítem
      for (const item of dto.items) {
        await tx.stock.updateMany({
          where: {
            skuId: item.skuId,
            storeId: dto.fulfillingStoreId,
          },
          data: { reservedQuantity: { increment: item.quantity } },
        });

        await tx.stockMovement.create({
          data: {
            tenantId: user.tenantId,
            skuId: item.skuId,
            fromStoreId: dto.fulfillingStoreId,
            movementType: 'RESERVED',
            quantity: item.quantity,
            referenceDocId: newOrder.id,
            referenceDocType: 'InterStoreOrder',
            createdById: user.id,
          },
        });
      }

      return newOrder;
    });

    // Encolar print job para bodega (fuera de transacción)
    await this.printService.enqueuePicking(order);

    return order;
  }

  async findAll(tenantId: string, storeId: string | null, role: string) {
    const whereClause =
      role === 'WAREHOUSE_OP' || role === 'WAREHOUSE_MANAGER'
        ? { tenantId, fulfillingStoreId: storeId! }
        : role === 'CASHIER' || role === 'STORE_MANAGER'
          ? { tenantId, requestingStoreId: storeId! }
          : { tenantId };

    return this.prisma.interStoreOrder.findMany({
      where: whereClause,
      include: {
        items: { include: { sku: { include: { product: { select: { reference: true, name: true } } } } } },
        requestingStore: { select: { name: true, code: true } },
        fulfillingStore: { select: { name: true, code: true } },
        createdBy: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async findOne(tenantId: string, orderId: string) {
    const order = await this.prisma.interStoreOrder.findFirst({
      where: { id: orderId, tenantId },
      include: {
        items: {
          include: {
            sku: { include: { product: true } },
            location: true,
          },
        },
        requestingStore: true,
        fulfillingStore: true,
        createdBy: { select: { firstName: true, lastName: true, email: true } },
        pickedBy: { select: { firstName: true, lastName: true } },
        printJobs: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });

    if (!order) throw new NotFoundException('Pedido no encontrado');
    return order;
  }

  async updateStatus(orderId: string, newStatus: OrderStatus, user: AuthUser) {
    const order = await this.prisma.interStoreOrder.findFirst({
      where: { id: orderId, tenantId: user.tenantId },
    });

    if (!order) throw new NotFoundException('Pedido no encontrado');

    const transition = ORDER_STATUS_TRANSITIONS.find(
      (t) => t.from === order.status && t.to === newStatus,
    );

    if (!transition) {
      throw new BadRequestException(
        `Transición inválida: ${order.status} → ${newStatus}`,
      );
    }

    if (!transition.allowedRoles.includes(user.role)) {
      throw new ForbiddenException(
        `Rol '${user.role}' no puede ejecutar esta transición`,
      );
    }

    const timestamps: Record<string, Date> = {};
    if (newStatus === 'CONFIRMED') timestamps.confirmedAt = new Date();
    if (newStatus === 'PICKING') timestamps.pickedAt = new Date();
    if (newStatus === 'SHIPPED') timestamps.shippedAt = new Date();
    if (newStatus === 'RECEIVED') timestamps.receivedAt = new Date();

    return this.prisma.interStoreOrder.update({
      where: { id: orderId },
      data: {
        status: newStatus,
        pickedById: newStatus === 'PICKING' ? user.id : undefined,
        ...timestamps,
      },
    });
  }

  async confirmPicking(orderId: string, itemId: string, quantityFulfilled: number, locationId: string, user: AuthUser) {
    const item = await this.prisma.orderItem.findFirst({
      where: { id: itemId, orderId },
      include: { order: true },
    });

    if (!item) throw new NotFoundException('Ítem de pedido no encontrado');
    if (item.order.tenantId !== user.tenantId) throw new ForbiddenException();

    return this.prisma.orderItem.update({
      where: { id: itemId },
      data: { quantityFulfilled, locationId },
    });
  }
}
