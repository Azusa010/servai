import { eventHandler, getQuery } from 'h3';
import { verifyAccessToken } from '~/utils/jwt-utils';
import { MOCK_KNOWLEDGE_BASES } from '~/utils/mock-data';
import { unAuthorizedResponse, usePageResponseSuccess } from '~/utils/response';

export default eventHandler((event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const { name, page = 1, pageSize = 20, status } = getQuery(event);

  let listData = MOCK_KNOWLEDGE_BASES.filter(
    (item) => item.tenantId === userinfo.tenantId,
  );

  if (name) {
    const keyword = String(name).trim().toLowerCase();

    listData = listData.filter((item) =>
      item.name.toLowerCase().includes(keyword),
    );
  }

  if (['disabled', 'enabled'].includes(String(status))) {
    listData = listData.filter((item) => item.status === status);
  }

  return usePageResponseSuccess(page as string, pageSize as string, listData);
});
