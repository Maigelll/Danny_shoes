import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { StoresService } from './stores.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '@dannyshoes/shared';

@ApiTags('stores')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('stores')
export class StoresController {
  constructor(private storesService: StoresService) {}

  @Get()
  @ApiOperation({ summary: 'Listar locales y bodegas del tenant' })
  findAll(@CurrentUser() user: AuthUser) {
    return this.storesService.findAll(user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de un local/bodega' })
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.storesService.findOne(user.tenantId, id);
  }

  @Post()
  @Roles('TENANT_ADMIN')
  @ApiOperation({ summary: 'Crear local o bodega' })
  create(@CurrentUser() user: AuthUser, @Body() dto: any) {
    return this.storesService.create(user.tenantId, dto);
  }

  @Patch(':id')
  @Roles('TENANT_ADMIN')
  @ApiOperation({ summary: 'Actualizar local o bodega' })
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: any) {
    return this.storesService.update(user.tenantId, id, dto);
  }
}
