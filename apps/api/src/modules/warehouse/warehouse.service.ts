import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class WarehouseService {
  constructor(private prisma: PrismaService) {}

  async getPendingOrders(storeId: string) {
    return this.prisma.interStoreOrder.findMany({
      where: {
        fulfillingStoreId: storeId,
        status: { in: ['PENDING', 'CONFIRMED', 'PICKING'] },
      },
      include: {
        items: {
          include: {
            sku: {
              include: {
                product: { select: { reference: true, name: true, color: true } },
              },
            },
            location: true,
          },
        },
        requestingStore: { select: { name: true, code: true } },
        createdBy: { select: { firstName: true, lastName: true } },
      },
      orderBy: { requestedAt: 'asc' },
    });
  }

  async receiveStock(dto: {
    tenantId: string;
    storeId: string;
    userId: string;
    items: Array<{ skuId: string; locationId: string; quantity: number }>;
    supplierId?: string;
    notes?: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      for (const item of dto.items) {
        await tx.stock.upsert({
          where: { skuId_storeId: { skuId: item.skuId, storeId: dto.storeId } },
          update: { quantity: { increment: item.quantity }, locationId: item.locationId },
          create: {
            skuId: item.skuId,
            storeId: dto.storeId,
            locationId: item.locationId,
            quantity: item.quantity,
          },
        });

        await tx.stockMovement.create({
          data: {
            tenantId: dto.tenantId,
            skuId: item.skuId,
            toStoreId: dto.storeId,
            locationId: item.locationId,
            movementType: 'PURCHASE',
            quantity: item.quantity,
            createdById: dto.userId,
            metadata: { supplierId: dto.supplierId, notes: dto.notes },
          },
        });
      }
    });
  }

  async getLocations(storeId: string) {
    return this.prisma.inventoryLocation.findMany({
      where: { storeId },
      include: {
        stock: {
          include: {
            sku: { include: { product: { select: { reference: true, name: true } } } },
          },
        },
      },
      orderBy: { fullCode: 'asc' },
    });
  }

  async createLocation(storeId: string, dto: { aisle: string; rack: string; level: string; bin?: string }) {
    const fullCode = [dto.aisle, dto.rack, dto.level, dto.bin].filter(Boolean).join('-');
    return this.prisma.inventoryLocation.create({
      data: { storeId, ...dto, fullCode },
    });
  }
}
