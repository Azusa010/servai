import { eventHandler, getQuery, setResponseStatus } from 'h3';
import { verifyAccessToken } from '~/utils/jwt-utils';
import { getTicketSlaStatus } from '~/utils/ticket-utils';
import { MOCK_TICKETS } from '~/utils/mock-data';
import {
  unAuthorizedResponse,
  useResponseError,
  useResponseSuccess,
} from '~/utils/response';

export default eventHandler((event) => {
  const userinfo = verifyAccessToken(event);

  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const { id: idQuery } = getQuery(event);
  const id = Number(idQuery);

  if (!Number.isInteger(id) || id <= 0) {
    setResponseStatus(event, 400);
    return useResponseError('工单编号无效');
  }

  const ticket = MOCK_TICKETS.find(
    (item) => item.id === id && item.tenantId === userinfo.tenantId,
  );

  if (!ticket) {
    setResponseStatus(event, 404);
    return useResponseError('工单不存在');
  }

  return useResponseSuccess({
    ...ticket,
    slaStatus: getTicketSlaStatus(ticket),
  });
});
