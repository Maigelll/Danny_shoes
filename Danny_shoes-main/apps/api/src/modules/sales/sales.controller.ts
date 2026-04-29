import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '@dannyshoes/shared';

@ApiTags('sales')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sales')
export class SalesController {
  constructor(private salesService: SalesService) {}

  @Post()
  @Roles('CASHIER', 'STORE_MANAGER')
  @ApiOperation({ summary: 'Registrar venta' })
  create(@Body() dto: any, @CurrentUser() user: AuthUser) {
    return this.salesService.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Ventas del local' })
  findByStore(
    @CurrentUser() user: AuthUser,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ) {
    return this.salesService.findByStore(user.tenantId, user.storeId!, +page, +limit);
  }

  @Patch(':id/void')
  @Roles('STORE_MANAGER', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'Anular venta' })
  voidSale(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.salesService.voidSale(user.tenantId, id, user.id);
  }
}
