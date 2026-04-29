import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { WarehouseService } from './warehouse.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '@dannyshoes/shared';

@ApiTags('warehouse')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('warehouse')
export class WarehouseController {
  constructor(private warehouseService: WarehouseService) {}

  @Get('orders/pending')
  @Roles('WAREHOUSE_OP', 'WAREHOUSE_MANAGER', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'Pedidos pendientes de picking en bodega' })
  getPendingOrders(@CurrentUser() user: AuthUser): Promise<any[]> {
    return this.warehouseService.getPendingOrders(user.storeId!);
  }

  @Post('receive')
  @Roles('WAREHOUSE_OP', 'WAREHOUSE_MANAGER', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'Ingresar mercancía de proveedor' })
  receiveStock(@Body() dto: any, @CurrentUser() user: AuthUser) {
    return this.warehouseService.receiveStock({
      tenantId: user.tenantId,
      storeId: user.storeId!,
      userId: user.id,
      ...dto,
    });
  }

  @Get('locations')
  @Roles('WAREHOUSE_OP', 'WAREHOUSE_MANAGER', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'Mapa de ubicaciones en bodega' })
  getLocations(@CurrentUser() user: AuthUser) {
    return this.warehouseService.getLocations(user.storeId!);
  }

  @Post('locations')
  @Roles('WAREHOUSE_MANAGER', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'Crear ubicación en estantería' })
  createLocation(@Body() dto: any, @CurrentUser() user: AuthUser) {
    return this.warehouseService.createLocation(user.storeId!, dto);
  }
}
