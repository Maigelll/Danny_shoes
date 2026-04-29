export interface StockLevel {
  skuId: string;
  storeId: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  locationCode?: string;
}

export interface StockCheckResult {
  skuId: string;
  reference: string;
  size: string;
  localStock: number;
  warehouseStock: number;
  locations: Array<{ storeId: string; storeName: string; quantity: number; locationCode: string }>;
}

export interface PrintTicketPayload {
  jobType: 'PICKING' | 'TRANSFER' | 'INVOICE' | 'LABEL' | 'RECEIPT';
  orderId?: string;
  reference: string;
  size: string;
  requestingStoreName: string;
  fulfillingStoreName: string;
  locationCode: string;
  quantity: number;
  movementType: string;
  barcode: string;
  operatorName: string;
  timestamp: string;
  notes?: string;
}
