import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import type { StockCheckResult } from '@dannyshoes/shared';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async checkStock(tenantId: string, reference: string, size: string, requestingStoreId: string): Promise<StockCheckResult> {
    const sku = await this.prisma.skuVariant.findFirst({
      where: { size, product: { tenantId, reference } },
      include: {
        product: true,
        stock: {
          include: {
            store: { select: { id: true, name: true, code: true, isCentralWarehouse: true } },
            location: true,
          },
        },
      },
    });

    if (!sku) throw new NotFoundException(`SKU ${reference} talla ${size} no encontrado`);

    const requestingStock = sku.stock.find((s) => s.storeId === requestingStoreId);
    const warehouseStock = sku.stock.find((s) => s.store.isCentralWarehouse);

    return {
      skuId: sku.id,
      reference: sku.product.reference,
      size: sku.size,
      localStock: (requestingStock?.quantity ?? 0) - (requestingStock?.reservedQuantity ?? 0),
      warehouseStock: (warehouseStock?.quantity ?? 0) - (warehouseStock?.reservedQuantity ?? 0),
      locations: sku.stock.map((s) => ({
        storeId: s.storeId,
        storeName: s.store.name,
        quantity: s.quantity - s.reservedQuantity,
        locationCode: s.location?.fullCode ?? 'Sin ubicación',
      })),
    };
  }

  async getStockByStore(tenantId: string, storeId: string, page = 1, limit = 50) {
    const [items, total] = await Promise.all([
      this.prisma.stock.findMany({
        where: { store: { tenantId }, storeId },
        include: {
          sku: { include: { product: { select: { reference: true, name: true, brand: true, color: true, salePrice: true } } } },
          location: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.stock.count({ where: { store: { tenantId }, storeId } }),
    ]);

    return {
      data: items.map((s) => ({
        skuId: s.skuId,
        reference: s.sku.product.reference,
        name: s.sku.product.name,
        brand: s.sku.product.brand,
        color: s.sku.product.color,
        size: s.sku.size,
        barcode: s.sku.barcode,
        salePrice: s.sku.product.salePrice,
        quantity: s.quantity,
        reservedQuantity: s.reservedQuantity,
        availableQuantity: s.quantity - s.reservedQuantity,
        locationCode: s.location?.fullCode ?? null,
        minStockAlert: s.sku.minStockAlert,
        isCritical: (s.quantity - s.reservedQuantity) <= s.sku.minStockAlert,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getLowStockAlerts(tenantId: string) {
    const allStock = await this.prisma.stock.findMany({
      where: { store: { tenantId } },
      include: {
        sku: { include: { product: { select: { reference: true, name: true } } } },
        store: { select: { name: true, code: true } },
      },
    });

    return allStock
      .filter((s) => s.quantity - s.reservedQuantity <= s.sku.minStockAlert)
      .map((s) => ({
        reference: s.sku.product.reference,
        name: s.sku.product.name,
        size: s.sku.size,
        store: s.store.name,
        available: s.quantity - s.reservedQuantity,
        minAlert: s.sku.minStockAlert,
      }));
  }

  async adjustStock(
    tenantId: string,
    skuId: string,
    storeId: string,
    quantity: number,
    reason: string,
    userId: string,
  ) {
    const stock = await this.prisma.stock.findUnique({
      where: { skuId_storeId: { skuId, storeId } },
    });

    if (!stock) throw new NotFoundException('Stock no encontrado');

    const newQty = stock.quantity + quantity;
    if (newQty < 0) throw new BadRequestException('El ajuste resultaría en stock negativo');

    const [updatedStock] = await this.prisma.$transaction([
      this.prisma.stock.update({
        where: { skuId_storeId: { skuId, storeId } },
        data: { quantity: newQty },
      }),
      this.prisma.stockMovement.create({
        data: {
          tenantId,
          skuId,
          toStoreId: quantity > 0 ? storeId : undefined,
          fromStoreId: quantity < 0 ? storeId : undefined,
          movementType: 'ADJUSTMENT',
          quantity: Math.abs(quantity),
          createdById: userId,
          metadata: { reason },
        },
      }),
    ]);

    return updatedStock;
  }
}
