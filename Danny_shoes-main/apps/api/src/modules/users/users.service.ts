import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.user.findMany({
      where: { tenantId },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, isActive: true, lastLogin: true,
        store: { select: { name: true, code: true } },
      },
      orderBy: { firstName: 'asc' },
    });
  }

  async create(tenantId: string, dto: {
    email: string; password: string; firstName: string;
    lastName: string; role: any; storeId?: string;
  }) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email ya registrado');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    return this.prisma.user.create({
      data: { tenantId, passwordHash, email: dto.email, firstName: dto.firstName, lastName: dto.lastName, role: dto.role, storeId: dto.storeId },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, storeId: true },
    });
  }

  async update(tenantId: string, id: string, dto: any): Promise<any> {
    const user = await this.prisma.user.findFirst({ where: { id, tenantId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    if (dto.password) {
      dto.passwordHash = await bcrypt.hash(dto.password, 12);
      delete dto.password;
    }

    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true },
    });
  }
}
