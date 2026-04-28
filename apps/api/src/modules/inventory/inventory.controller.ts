import { Controller, Get, Query, Param, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import type { AuthUser } from '@dannyshoes/shared';

@ApiTags('inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Get('check')
  @ApiOperation({ summary: 'Verificar stock de un SKU específico' })
  @ApiQuery({ name: 'reference', required: true })
  @ApiQuery({ name: 'size', required: true })
  checkStock(
    @CurrentUser() user: AuthUser,
    @Query('reference') reference: string,
    @Query('size') size: string,
  ) {
    return this.inventoryService.checkStock(user.tenantId, reference, size, user.storeId!);
  }

  @Get('store/:storeId')
  @ApiOperation({ summary: 'Stock completo de un local/bodega' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getStockByStore(
    @CurrentUser() user: AuthUser,
    @Param('storeId') storeId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ) {
    return this.inventoryService.getStockByStore(user.tenantId, storeId, +page, +limit);
  }

  @Get('alerts/low-stock')
  @Roles('STORE_MANAGER', 'WAREHOUSE_MANAGER', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'Alertas de stock crítico' })
  getLowStockAlerts(@CurrentUser() user: AuthUser) {
    return this.inventoryService.getLowStockAlerts(user.tenantId);
  }

  @Patch('adjust')
  @Roles('WAREHOUSE_MANAGER', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'Ajuste manual de inventario' })
  adjustStock(
    @CurrentUser() user: AuthUser,
    @Body() body: { skuId: string; storeId: string; quantity: number; reason: string },
  ) {
    return this.inventoryService.adjustStock(
      user.tenantId, body.skuId, body.storeId, body.quantity, body.reason, user.id,
    );
  }
}
