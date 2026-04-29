import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PrintService } from './print.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '@dannyshoes/shared';

@ApiTags('print')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('print')
export class PrintController {
  constructor(private printService: PrintService) {}

  @Get('jobs/pending')
  @ApiOperation({ summary: 'Obtener print jobs pendientes para el local del agente' })
  getPendingJobs(@CurrentUser() user: AuthUser) {
    return this.printService.getPendingJobs(user.storeId!);
  }

  @Patch('jobs/:id/ack')
  @ApiOperation({ summary: 'Confirmar impresión (llamado por DannyAgent)' })
  acknowledgeJob(
    @Param('id') id: string,
    @Body() body: { status: 'PRINTED' | 'FAILED'; errorMsg?: string },
  ) {
    return this.printService.acknowledgeJob(id, body.status, body.errorMsg);
  }

  @Patch('jobs/retry')
  @ApiOperation({ summary: 'Reintentar jobs fallidos' })
  retryJobs(@CurrentUser() user: AuthUser) {
    return this.printService.retryFailedJobs(user.storeId!);
  }
}
