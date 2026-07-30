import type { TicketInfo, TicketPriority, TicketType } from '~/utils/mock-data';

import { eventHandler, readBody, setResponseStatus } from 'h3';

import { verifyAccessToken } from '~/utils/jwt-utils';
import { MOCK_TICKETS } from '~/utils/mock-data';
import {
  unAuthorizedResponse,
  useResponseError,
  useResponseSuccess,
} from '~/utils/response';

interface CreateTicketBody {
  consumer: {
    contactName: string;
    customerName: string;
    email: string;
    phone: string;
  };
  description: string;
  priority: TicketPriority;
  slaDeadline: string;
  title: string;
  type: TicketType;
}

const priorities = new Set<TicketPriority>(['P1', 'P2', 'P3']);

const types = new Set<TicketType>([
  'complain',
  'consult',
  'demand',
  'fault',
  'operation',
  'warning',
]);

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);

  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const body = await readBody<CreateTicketBody>(event);

  const title = String(body.title ?? '').trim();
  const description = String(body.description ?? '').trim();
  const customerName = String(body.consumer?.customerName ?? '').trim();
  const contactName = String(body.consumer?.contactName ?? '').trim();
  const email = String(body.consumer?.email ?? '').trim();
  const phone = String(body.consumer?.phone ?? '').trim();

  if (
    !title ||
    !description ||
    !customerName ||
    !contactName ||
    !email ||
    !phone
  ) {
    setResponseStatus(event, 400);
    return useResponseError('请填写完整的工单和客户信息');
  }

  if (!priorities.has(body.priority as TicketPriority)) {
    setResponseStatus(event, 400);
    return useResponseError('工单优先级无效');
  }

  if (!types.has(body.type as TicketType)) {
    setResponseStatus(event, 400);
    return useResponseError('工单类型无效');
  }

  const slaDeadline = new Date(String(body.slaDeadline ?? ''));

  if (
    Number.isNaN(slaDeadline.getTime()) ||
    slaDeadline.getTime() <= Date.now()
  ) {
    setResponseStatus(event, 400);
    return useResponseError('SLA截止时间无效');
  }

  const id = Math.max(0, ...MOCK_TICKETS.map((item) => item.id)) + 1;

  const consumerId =
    Math.max(0, ...MOCK_TICKETS.map((item) => item.consumer.id)) + 1;

  const timelineId =
    Math.max(
      0,
      ...MOCK_TICKETS.flatMap((item) =>
        item.timelines.map((timeline) => timeline.id),
      ),
    ) + 1;

  const createTime = new Date().toISOString();
  const datePart = createTime.slice(0, 10).replaceAll('-', '');
  const ticketNo = `TK${datePart}${String(id).padStart(4, '0')}`;

  const ticket: TicketInfo = {
    attachments: [],
    consumer: {
      contactName,
      customerName,
      email,
      id: consumerId,
      phone,
    },
    createTime,
    creatorId: userinfo.id,
    description,
    id,
    PICid: null,
    priority: body.priority as TicketPriority,
    slaDeadline: slaDeadline.toISOString(),
    source: 'manual',
    sourceRef: null,
    status: 'Unassigned',
    tenantId: userinfo.tenantId,
    ticketNo,
    timelines: [
      {
        action: 'create',
        actionTime: createTime,
        actorId: userinfo.id,
        afterPICid: null,
        afterStatus: 'Unassigned',
        comment: '后台手动创建工单',
        id: timelineId,
        prePICid: null,
        preStatus: null,
      },
    ],
    title,
    type: body.type as TicketType,
    updateTime: createTime,
  };

  MOCK_TICKETS.unshift(ticket);

  return useResponseSuccess(ticket);
});
