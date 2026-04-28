import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { renderPickingTicket } from './escpos/ticket.renderer';
import type { PrintTicketPayload } from '@dannyshoes/shared';
import type { InterStoreOrder } from '@dannyshoes/database';

@Injectable()
export class PrintService {
  private readonly logger = new Logger(PrintService.name);

  constructor(private prisma: PrismaService) {}

  async enqueuePicking(order: any) {
    for (const item of order.items) {
      const payload: PrintTicketPayload = {
        jobType: 'PICKING',
        orderId: order.id,
        reference: item.sku.product.reference,
        size: item.sku.size,
        requestingStoreName: order.requestingStore.name,
        fulfillingStoreName: order.fulfillingStore.name,
        locationCode: item.location?.fullCode ?? 'VERIFICAR UBICACIÓN',
        quantity: item.quantityRequested,
        movementType: 'Pedido Inter-tienda',
        barcode: item.sku.barcode ?? item.sku.id,
        operatorName: `${order.createdBy.firstName} ${order.createdBy.lastName}`,
        timestamp: new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' }),
        notes: order.notes,
      };

      const escposBase64 = renderPickingTicket(payload);

      await this.prisma.printJob.create({
        data: {
          tenantId: order.tenantId,
          storeId: order.fulfillingStoreId,
          orderId: order.id,
          jobType: 'PICKING',
          payload: { escposBase64, metadata: payload },
        },
      });

      this.logger.log(
        `Print job enqueued for order ${order.id} — ${payload.reference} T${payload.size}`,
      );
    }
  }

  async getPendingJobs(storeId: string) {
    return this.prisma.printJob.findMany({
      where: { storeId, status: 'QUEUED' },
      orderBy: { createdAt: 'asc' },
    });
  }

  async acknowledgeJob(jobId: string, status: 'PRINTED' | 'FAILED', errorMsg?: string) {
    return this.prisma.printJob.update({
      where: { id: jobId },
      data: {
        status,
        printedAt: status === 'PRINTED' ? new Date() : undefined,
        errorMsg: errorMsg ?? null,
      },
    });
  }

  async retryFailedJobs(storeId: string) {
    await this.prisma.printJob.updateMany({
      where: { storeId, status: 'FAILED', retryCount: { lt: 3 } },
      data: { status: 'QUEUED', retryCount: { increment: 1 } },
    });
  }
}
