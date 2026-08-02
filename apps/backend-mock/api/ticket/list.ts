import { eventHandler, getQuery } from 'h3';
import { verifyAccessToken } from '~/utils/jwt-utils';
import { MOCK_TICKETS, MOCK_USERS } from '~/utils/mock-data';
import { unAuthorizedResponse, usePageResponseSuccess } from '~/utils/response';
import { getTicketSlaStatus } from '~/utils/ticket-utils';
export default eventHandler((event) => {
  const userinfo = verifyAccessToken(event);

  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const {
    deptId,
    endTime,
    keyword,
    page = 1,
    pageSize = 20,
    PICid,
    priority,
    startTime,
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

  if (type) {
    listData = listData.filter((item) => item.type === String(type));
  }

  if (PICid !== undefined && PICid !== '') {
    const assigneeId = Number(PICid);

    if (Number.isInteger(assigneeId)) {
      listData = listData.filter((item) => item.PICid === assigneeId);
    }
  }
  if (startTime) {
    const startDate = new Date(String(startTime));

    if (!Number.isNaN(startDate.getTime())) {
      listData = listData.filter(
        (item) => new Date(item.createTime).getTime() >= startDate.getTime(),
      );
    }
  }

  if (endTime) {
    const endDate = new Date(String(endTime));

    if (!Number.isNaN(endDate.getTime())) {
      listData = listData.filter(
        (item) => new Date(item.createTime).getTime() <= endDate.getTime(),
      );
    }
  }
  if (deptId !== undefined && deptId !== '') {
    const departmentId = Number(deptId);

    if (Number.isInteger(departmentId)) {
      const departmentPICIds = new Set(
        MOCK_USERS.filter(
          (user) =>
            user.tenantId === userinfo.tenantId && user.deptId === departmentId,
        ).map((user) => user.id),
      );

      listData = listData.filter(
        (item) => item.PICid !== null && departmentPICIds.has(item.PICid),
      );
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

  const result = listData.map((item) => ({
    ...item,
    slaStatus: getTicketSlaStatus(item),
  }));

  return usePageResponseSuccess(page as string, pageSize as string, result);
});
