import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '@dannyshoes/shared';

@ApiTags('products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar productos con búsqueda' })
  findAll(
    @CurrentUser() user: AuthUser,
    @Query('search') search?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ) {
    return this.productsService.findAll(user.tenantId, search, +page, +limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de producto con stock por tienda' })
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.productsService.findOne(user.tenantId, id);
  }

  @Post()
  @Roles('STORE_MANAGER', 'WAREHOUSE_MANAGER', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'Crear producto' })
  create(@CurrentUser() user: AuthUser, @Body() dto: any) {
    return this.productsService.create(user.tenantId, dto);
  }

  @Patch(':id')
  @Roles('STORE_MANAGER', 'WAREHOUSE_MANAGER', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'Actualizar producto' })
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: any) {
    return this.productsService.update(user.tenantId, id, dto);
  }

  @Post(':id/variants')
  @Roles('WAREHOUSE_MANAGER', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'Agregar talla al producto' })
  addVariant(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: any) {
    return this.productsService.addVariant(user.tenantId, id, dto);
  }
}
