import type { TicketAction } from '~/utils/mock-data';

import { eventHandler, readBody, setResponseStatus } from 'h3';
import { verifyAccessToken } from '~/utils/jwt-utils';
import { MOCK_TICKETS, MOCK_USERS } from '~/utils/mock-data';
import {
  unAuthorizedResponse,
  useResponseError,
  useResponseSuccess,
} from '~/utils/response';
import { getNextTicketStatus, getTicketSlaStatus } from '~/utils/ticket-utils';

interface OperateTicketBody {
  action: Exclude<TicketAction, 'create'>;
  afterPICid?: number;
  comment?: string;
  id: number;
}

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);

  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const body = await readBody<OperateTicketBody>(event);

  if (!Number.isInteger(body.id) || body.id <= 0) {
    setResponseStatus(event, 400);
    return useResponseError('工单编号无效');
  }

  const ticket = MOCK_TICKETS.find(
    (item) => item.id === body.id && item.tenantId === userinfo.tenantId,
  );

  if (!ticket) {
    setResponseStatus(event, 404);
    return useResponseError('工单不存在');
  }

  const nextStatus = getNextTicketStatus(ticket.status, body.action);

  if (!nextStatus) {
    setResponseStatus(event, 400);
    return useResponseError('当前状态不允许执行该操作');
  }

  const preStatus = ticket.status;
  const prePICid = ticket.PICid;
  let afterPICid = ticket.PICid;

  if (body.action === 'claim') {
    afterPICid = userinfo.id;
  }

  if (body.action === 'transfer') {
    const targetPICid = body.afterPICid;

    if (typeof targetPICid !== 'number' || !Number.isInteger(targetPICid)) {
      setResponseStatus(event, 400);
      return useResponseError('请选择新的负责人');
    }

    if (targetPICid === ticket.PICid) {
      setResponseStatus(event, 400);
      return useResponseError('新负责人不能与当前负责人相同');
    }
    const targetUser = MOCK_USERS.find(
      (item) => item.id === targetPICid && item.tenantId === userinfo.tenantId,
    );

    if (!targetUser) {
      setResponseStatus(event, 400);
      return useResponseError('负责人不存在');
    }

    afterPICid = targetUser.id;
  }

  const actionTime = new Date().toISOString();
  if (body.action === 'resume') {
    const suspendedTimeline = [...ticket.timelines]
      .toReversed()
      .find((item) => item.action === 'suspend');

    if (suspendedTimeline) {
      const suspendedAt = new Date(suspendedTimeline.actionTime).getTime();
      const resumedAt = new Date(actionTime).getTime();
      const deadline = new Date(ticket.slaDeadline).getTime();

      if (
        !Number.isNaN(suspendedAt) &&
        !Number.isNaN(deadline) &&
        resumedAt > deadline
      ) {
        const suspendedDuration = resumedAt - suspendedAt;

        ticket.slaDeadline = new Date(
          deadline + suspendedDuration,
        ).toISOString();
      }
    }
  }

  const timelineId =
    Math.max(
      0,
      ...MOCK_TICKETS.flatMap((item) =>
        item.timelines.map((timeline) => timeline.id),
      ),
    ) + 1;

  ticket.status = nextStatus;
  ticket.PICid = afterPICid;
  ticket.updateTime = actionTime;
  ticket.timelines.push({
    action: body.action,
    actionTime,
    actorId: userinfo.id,
    afterPICid,
    afterStatus: nextStatus,
    comment: String(body.comment || '').trim(),
    id: timelineId,
    prePICid,
    preStatus,
  });

  return useResponseSuccess({
    ...ticket,
    slaStatus: getTicketSlaStatus(ticket),
  });
});
