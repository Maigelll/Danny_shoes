import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, search?: string, page = 1, limit = 50) {
    const where = {
      tenantId,
      isActive: true,
      ...(search && {
        OR: [
          { reference: { contains: search, mode: 'insensitive' as const } },
          { name: { contains: search, mode: 'insensitive' as const } },
          { brand: { contains: search, mode: 'insensitive' as const } },
          { variants: { some: { barcode: { contains: search, mode: 'insensitive' as const } } } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          variants: { where: { isActive: true }, orderBy: { size: 'asc' } },
          supplier: { select: { name: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { reference: 'asc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(tenantId: string, id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, tenantId },
      include: {
        variants: {
          where: { isActive: true },
          include: {
            stock: {
              include: { store: { select: { name: true, code: true } }, location: true },
            },
          },
          orderBy: { size: 'asc' },
        },
        supplier: true,
      },
    });
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }

  async create(tenantId: string, dto: any) {
    const existing = await this.prisma.product.findUnique({
      where: { tenantId_reference: { tenantId, reference: dto.reference } },
    });
    if (existing) throw new ConflictException(`Referencia '${dto.reference}' ya existe`);

    return this.prisma.product.create({
      data: { ...dto, tenantId },
      include: { variants: true },
    });
  }

  async update(tenantId: string, id: string, dto: any) {
    const product = await this.prisma.product.findFirst({ where: { id, tenantId } });
    if (!product) throw new NotFoundException('Producto no encontrado');
    return this.prisma.product.update({ where: { id }, data: dto, include: { variants: true } });
  }

  async addVariant(tenantId: string, productId: string, dto: { size: string; barcode?: string; minStockAlert?: number }) {
    const product = await this.prisma.product.findFirst({ where: { id: productId, tenantId } });
    if (!product) throw new NotFoundException('Producto no encontrado');

    return this.prisma.skuVariant.create({
      data: { productId, ...dto },
    });
  }
}
