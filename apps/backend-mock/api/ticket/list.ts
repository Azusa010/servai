import { eventHandler, getQuery } from 'h3';
import { verifyAccessToken } from '~/utils/jwt-utils';
import { MOCK_TICKETS } from '~/utils/mock-data';
import { unAuthorizedResponse, usePageResponseSuccess } from '~/utils/response';

export default eventHandler((event) => {
  const userinfo = verifyAccessToken(event);

  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const {
    keyword,
    page = 1,
    pageSize = 20,
    PICid,
    priority,
    status,
    type,
  } = getQuery(event);

  let listData = MOCK_TICKETS.filter(
    (item) => item.tenantId === userinfo.tenantId,
  );

  if (status) {
    listData = listData.filter((item) => item.status === String(status));
  }

  if (priority) {
    listData = listData.filter((item) => item.priority === String(priority));
  }

  if(type){
    listData = listData.filter((item)=> item.type === String(type));
  }

  if (PICid !== undefined && PICid !== '') {
    const assigneeId = Number(PICid);

    if (Number.isInteger(assigneeId)) {
      listData = listData.filter((item) => item.PICid === assigneeId);
    }
  }

  if (keyword) {
    const normalizedKeyword = String(keyword).trim().toLowerCase();

    listData = listData.filter((item) =>
      [
        item.ticketNo,
        item.title,
        item.consumer.customerName,
        item.consumer.contactName,
      ].some((value) => value.toLowerCase().includes(normalizedKeyword)),
    );
  }

  return usePageResponseSuccess(page as string, pageSize as string, listData);
});
