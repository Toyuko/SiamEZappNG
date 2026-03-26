export type InvoiceStatus = 'UNPAID' | 'PARTIAL' | 'PAID' | 'OVERDUE';

export type ClientInvoice = {
  id: string;
  invoiceNo: string;
  amount: number;
  currency: string;
  dueDate: string;
  status: InvoiceStatus;
};
