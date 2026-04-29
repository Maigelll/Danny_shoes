import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        _count: { select: { stores: true, users: true, products: true } },
      },
    });
    if (!tenant) throw new NotFoundException('Tenant no encontrado');
    return tenant;
  }

  async update(id: string, dto: { name?: string; settings?: any }) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) throw new NotFoundException('Tenant no encontrado');
    return this.prisma.tenant.update({ where: { id }, data: dto });
  }

  async getDashboardSummary(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [stores, pendingOrders, lowStockCount, todaySales] = await Promise.all([
      this.prisma.store.count({ where: { tenantId, isActive: true } }),
      this.prisma.interStoreOrder.count({
        where: { tenantId, status: { in: ['PENDING', 'CONFIRMED', 'PICKING'] } },
      }),
      this.prisma.stock.count({
        where: {
          store: { tenantId },
          quantity: { lte: this.prisma.stock.fields.reservedQuantity as any },
        },
      }),
      this.prisma.sale.aggregate({
        where: { tenantId, createdAt: { gte: today }, status: 'COMPLETED' },
        _sum: { total: true },
        _count: { id: true },
      }),
    ]);

    return {
      stores,
      pendingOrders,
      todaySalesTotal: todaySales._sum.total ?? 0,
      todaySalesCount: todaySales._count.id,
    };
  }
}
