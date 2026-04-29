import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import type { AuthUser } from '@dannyshoes/shared';
import type { OrderStatus } from '@dannyshoes/shared';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  @Roles('CASHIER', 'STORE_MANAGER', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'Crear pedido inter-tienda' })
  create(@Body() dto: CreateOrderDto, @CurrentUser() user: AuthUser) {
    return this.ordersService.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Listar pedidos según rol del usuario' })
  findAll(@CurrentUser() user: AuthUser) {
    return this.ordersService.findAll(user.tenantId, user.storeId, user.role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de un pedido' })
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.ordersService.findOne(user.tenantId, id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Actualizar estado del pedido' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
    @CurrentUser() user: AuthUser,
  ) {
    return this.ordersService.updateStatus(id, status, user);
  }

  @Patch(':id/items/:itemId/pick')
  @Roles('WAREHOUSE_OP', 'WAREHOUSE_MANAGER')
  @ApiOperation({ summary: 'Confirmar picking de un ítem' })
  confirmPicking(
    @Param('id') orderId: string,
    @Param('itemId') itemId: string,
    @Body() body: { quantityFulfilled: number; locationId: string },
    @CurrentUser() user: AuthUser,
  ) {
    return this.ordersService.confirmPicking(orderId, itemId, body.quantityFulfilled, body.locationId, user);
  }
}
