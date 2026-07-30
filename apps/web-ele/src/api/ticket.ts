import { requestClient } from '#/api/request';

export type TicketPriority = 'P1' | 'P2' | 'P3';

export type TicketStatus =
  | 'Canceled'
  | 'Closed'
  | 'Pending_Confirmation'
  | 'Processing'
  | 'Suspended'
  | 'Unassigned';

export type TicketAction =
  | 'cancel'
  | 'claim'
  | 'close'
  | 'confirm'
  | 'create'
  | 'resolve'
  | 'resume'
  | 'suspend'
  | 'transfer';

export type TicketSource = 'chat' | 'manual' | 'rule' | 'toc';

export type TicketType =
  | 'complain'
  | 'consult'
  | 'demand'
  | 'fault'
  | 'operation'
  | 'warning';

export interface TicketAttachment {
  id: number;
  name: string;
  size: number;
  type: string;
  url: string;
}

export interface TicketTimeline {
  action: TicketAction;
  actionTime: string;
  actorId: null | number;
  afterPICid: null | number;
  afterStatus: TicketStatus;
  comment: string;
  id: number;
  prePICid: null | number;
  preStatus: null | TicketStatus;
}

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

export interface TicketDetail extends TicketListItem {
  attachments: TicketAttachment[];
  createTime: string;
  creatorId: null | number;
  description: string;
  slaDeadline: string;
  source: TicketSource;
  sourceRef: null | string;
  tenantId: number;
  timelines: TicketTimeline[];
  type: TicketType;
}

export interface TicketListResult {
  items: TicketListItem[];
  total: number;
}

export function getTicketListApi(params: {
  endTime?: string;
  keyword?: string;
  page: number;
  pageSize: number;
  PICid?: number;
  priority?: TicketPriority;
  startTime?: string;
  status?: TicketStatus;
  type?: TicketType;
}) {
  return requestClient.get<TicketListResult>('/ticket/list', {
    params,
  });
}
export function getTicketDetailApi(id: number) {
  return requestClient.get<TicketDetail>('/ticket/detail', {
    params: { id },
  });
}

export interface OperateTicketParams {
  action: Exclude<TicketAction, 'create'>;
  afterPICid?: number;
  comment?: string;
  id: number;
}

export function operateTicketApi(data: OperateTicketParams) {
  return requestClient.post<TicketDetail>('/ticket/operate', data);
}

export interface CreateTicketParams {
  consumer: Omit<TicketConsumer, 'id'>;
  description: string;
  priority: TicketPriority;
  slaDeadline: string;
  title: string;
  type: TicketType;
}

export function createTicketApi(data: CreateTicketParams) {
  return requestClient.post<TicketDetail>('/ticket/create', data);
}

