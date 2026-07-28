import { eventHandler, getQuery } from 'h3';
import { verifyAccessToken } from '~/utils/jwt-utils';
import { MOCK_CHAT_CONVERSATIONS } from '~/utils/mock-data';
import { unAuthorizedResponse, usePageResponseSuccess } from '~/utils/response';

export default eventHandler((event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const { keyword, page = 1, pageSize = 20 } = getQuery(event);
  const searchKeyword = String(keyword ?? '')
    .trim()
    .toLowerCase();

  const conversations = MOCK_CHAT_CONVERSATIONS.filter(
    (item) =>
      item.tenantId === userinfo.tenantId &&
      item.userId === userinfo.id &&
      !item.deleted &&
      (!searchKeyword || item.title.toLowerCase().includes(searchKeyword)),
  ).toSorted(
    (first, second) =>
      new Date(second.updateTime).getTime() -
      new Date(first.updateTime).getTime(),
  );

  return usePageResponseSuccess(
    page as string,
    pageSize as string,
    conversations,
  );
});
