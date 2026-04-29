import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class StoresService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.store.findMany({
      where: { tenantId, isActive: true },
      include: {
        _count: { select: { users: true, stock: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const store = await this.prisma.store.findFirst({
      where: { id, tenantId },
      include: {
        users: { select: { id: true, firstName: true, lastName: true, role: true, isActive: true } },
        locations: { orderBy: { fullCode: 'asc' } },
      },
    });
    if (!store) throw new NotFoundException('Local no encontrado');
    return store;
  }

  async create(tenantId: string, dto: any) {
    return this.prisma.store.create({ data: { tenantId, ...dto } });
  }

  async update(tenantId: string, id: string, dto: any) {
    const store = await this.prisma.store.findFirst({ where: { id, tenantId } });
    if (!store) throw new NotFoundException('Local no encontrado');
    return this.prisma.store.update({ where: { id }, data: dto });
  }
}
