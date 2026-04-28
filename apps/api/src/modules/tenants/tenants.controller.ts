import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '@dannyshoes/shared';

@ApiTags('tenants')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tenants')
export class TenantsController {
  constructor(private tenantsService: TenantsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Obtener info del tenant actual' })
  getMyTenant(@CurrentUser() user: AuthUser) {
    return this.tenantsService.findOne(user.tenantId);
  }

  @Get('dashboard')
  @Roles('STORE_MANAGER', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'Resumen del dashboard gerencial' })
  getDashboard(@CurrentUser() user: AuthUser) {
    return this.tenantsService.getDashboardSummary(user.tenantId);
  }

  @Patch('settings')
  @Roles('TENANT_ADMIN')
  @ApiOperation({ summary: 'Actualizar configuración del tenant' })
  updateSettings(@CurrentUser() user: AuthUser, @Body() dto: any) {
    return this.tenantsService.update(user.tenantId, dto);
  }
}
