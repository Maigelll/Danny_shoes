import type { PrintTicketPayload } from '@dannyshoes/shared';

const ESC = '\x1B';
const GS = '\x1D';

export function renderPickingTicket(payload: PrintTicketPayload): string {
  const lines: string[] = [];

  const init = `${ESC}@`;                     // Reset
  const bold = `${ESC}E\x01`;                 // Bold ON
  const boldOff = `${ESC}E\x00`;              // Bold OFF
  const centerAlign = `${ESC}a\x01`;          // Center
  const leftAlign = `${ESC}a\x00`;            // Left
  const doubleHeight = `${ESC}!\x10`;         // Double height
  const normalSize = `${ESC}!\x00`;           // Normal size
  const cutPaper = `${GS}V\x41\x03`;         // Partial cut

  const separator = '─'.repeat(32);
  const thinSep = '·'.repeat(32);

  const ticket = [
    init,
    centerAlign,
    doubleHeight,
    bold,
    'DANNY ZAPATOS\n',
    normalSize,
    boldOff,
    `TICKET DE ${payload.jobType}\n`,
    separator + '\n',
    leftAlign,

    // Datos del pedido
    bold,
    `LOCAL: `,
    boldOff,
    `${payload.requestingStoreName}\n`,
    bold,
    `BODEGA: `,
    boldOff,
    `${payload.fulfillingStoreName}\n`,
    thinSep + '\n',

    // Producto
    centerAlign,
    bold,
    doubleHeight,
    `${payload.reference}\n`,
    normalSize,
    `TALLA: ${payload.size}\n`,
    boldOff,
    separator + '\n',
    leftAlign,

    // Ubicación (lo más importante para el bodeguero)
    bold,
    `UBICACION:\n`,
    doubleHeight,
    centerAlign,
    `${payload.locationCode}\n`,
    normalSize,
    boldOff,
    separator + '\n',
    leftAlign,

    // Cantidad
    `Cantidad: ${payload.quantity} par(es)\n`,
    `Tipo: ${payload.movementType}\n`,
    `Operario: ${payload.operatorName}\n`,
    `Fecha: ${payload.timestamp}\n`,
    thinSep + '\n',

    // Código de barras (CODE128)
    centerAlign,
    `${GS}h\x50`,                             // Barcode height 80
    `${GS}w\x02`,                             // Barcode width
    `${GS}H\x02`,                             // HRI below
    `${GS}k\x49${String.fromCharCode(payload.barcode.length)}${payload.barcode}`,
    '\n\n',

    payload.notes ? `Notas: ${payload.notes}\n` : '',
    '\n\n\n',
    cutPaper,
  ].join('');

  return Buffer.from(ticket, 'binary').toString('base64');
}
