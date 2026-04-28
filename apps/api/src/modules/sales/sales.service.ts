import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import type { AuthUser } from '@dannyshoes/shared';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: {
    items: Array<{ skuId: string; quantity: number; unitPrice: number; discount?: number }>;
    paymentMethod: string;
    notes?: string;
  }, user: AuthUser) {
    if (!user.storeId) throw new BadRequestException('Usuario sin local asignado');

    // Verificar stock para todos los items
    for (const item of dto.items) {
      const stock = await this.prisma.stock.findUnique({
        where: { skuId_storeId: { skuId: item.skuId, storeId: user.storeId } },
      });
      const available = (stock?.quantity ?? 0) - (stock?.reservedQuantity ?? 0);
      if (available < item.quantity) {
        throw new BadRequestException(`Stock insuficiente para SKU ${item.skuId}`);
      }
    }

    const subtotal = dto.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    const discountTotal = dto.items.reduce((sum, i) => sum + (i.discount ?? 0) * i.quantity, 0);
    const total = subtotal - discountTotal;

    const invoiceNumber = await this.generateInvoiceNumber(user.tenantId, user.storeId);

    return this.prisma.$transaction(async (tx) => {
      const sale = await tx.sale.create({
        data: {
          tenantId: user.tenantId,
          storeId: user.storeId!,
          cashierId: user.id,
          invoiceNumber,
          subtotal,
          discountTotal,
          total,
          paymentMethod: dto.paymentMethod,
          notes: dto.notes,
          items: {
            create: dto.items.map((item) => ({
              skuId: item.skuId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discount: item.discount ?? 0,
              lineTotal: (item.unitPrice - (item.discount ?? 0)) * item.quantity,
            })),
          },
        },
        include: { items: true },
      });

      // Descontar stock
      for (const item of dto.items) {
        await tx.stock.update({
          where: { skuId_storeId: { skuId: item.skuId, storeId: user.storeId! } },
          data: { quantity: { decrement: item.quantity } },
        });

        await tx.stockMovement.create({
          data: {
            tenantId: user.tenantId,
            skuId: item.skuId,
            fromStoreId: user.storeId,
            movementType: 'SALE',
            quantity: item.quantity,
            referenceDocId: sale.id,
            referenceDocType: 'Sale',
            createdById: user.id,
          },
        });
      }

      return sale;
    });
  }

  async findByStore(tenantId: string, storeId: string, page = 1, limit = 50) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [data, total, todayTotal] = await Promise.all([
      this.prisma.sale.findMany({
        where: { tenantId, storeId },
        include: {
          items: { include: { sku: { include: { product: { select: { reference: true, name: true } } } } } },
          cashier: { select: { firstName: true, lastName: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.sale.count({ where: { tenantId, storeId } }),
      this.prisma.sale.aggregate({
        where: { tenantId, storeId, createdAt: { gte: today }, status: 'COMPLETED' },
        _sum: { total: true },
        _count: { id: true },
      }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      todaySummary: { total: todayTotal._sum.total ?? 0, count: todayTotal._count.id },
    };
  }

  async voidSale(tenantId: string, saleId: string, userId: string) {
    const sale = await this.prisma.sale.findFirst({
      where: { id: saleId, tenantId },
      include: { items: true },
    });
    if (!sale) throw new NotFoundException('Venta no encontrada');
    if (sale.status === 'VOIDED') throw new BadRequestException('Venta ya anulada');

    return this.prisma.$transaction(async (tx) => {
      await tx.sale.update({ where: { id: saleId }, data: { status: 'VOIDED' } });

      for (const item of sale.items) {
        await tx.stock.update({
          where: { skuId_storeId: { skuId: item.skuId, storeId: sale.storeId } },
          data: { quantity: { increment: item.quantity } },
        });
        await tx.stockMovement.create({
          data: {
            tenantId,
            skuId: item.skuId,
            toStoreId: sale.storeId,
            movementType: 'RETURN',
            quantity: item.quantity,
            referenceDocId: saleId,
            referenceDocType: 'Sale',
            createdById: userId,
            metadata: { reason: 'void' },
          },
        });
      }
    });
  }

  private async generateInvoiceNumber(tenantId: string, storeId: string): Promise<string> {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    const settings = tenant?.settings as any;
    const prefix = settings?.invoicePrefix ?? 'FAC-';
    const count = await this.prisma.sale.count({ where: { tenantId, storeId } });
    return `${prefix}${String(count + 1).padStart(6, '0')}`;
  }
}
