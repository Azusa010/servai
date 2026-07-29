import { requestClient } from '#/api/request';

export type TicketPriority = 'P1' | 'P2' | 'P3';

export type TicketStatus =
  | 'Canceled'
  | 'Closed'
  | 'Pending_Confirmation'
  | 'Processing'
  | 'Suspended'
  | 'Unassigned';

export interface TicketConsumer {
  contactName: string;
  customerName: string;
  email: string;
  id: number;
  phone: string;
}

export interface TicketListItem {
  consumer: TicketConsumer;
  id: number;
  PICid: null | number;
  priority: TicketPriority;
  status: TicketStatus;
  ticketNo: string;
  title: string;
  updateTime: string;
}

export interface TicketListResult {
  items: TicketListItem[];
  total: number;
}

export function getTicketListApi(params: {
  keyword?: string;
  page: number;
  pageSize: number;
  PICid?: number;
  priority?: TicketPriority;
  status?: TicketStatus;
}) {
  return requestClient.get<TicketListResult>('/ticket/list', {
    params,
  });
}
