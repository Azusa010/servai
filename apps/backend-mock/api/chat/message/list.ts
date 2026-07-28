import { eventHandler, getQuery, setResponseStatus } from 'h3';
import { verifyAccessToken } from '~/utils/jwt-utils';
import { MOCK_CHAT_CONVERSATIONS, MOCK_CHAT_MESSAGES } from '~/utils/mock-data';
import {
  unAuthorizedResponse,
  usePageResponseSuccess,
  useResponseError,
} from '~/utils/response';

export default eventHandler((event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const {
    conversationId: conversationIdQuery,
    page = 1,
    pageSize = 50,
  } = getQuery(event);

  const conversationId = Number(conversationIdQuery);

  if (!Number.isInteger(conversationId)) {
    setResponseStatus(event, 400);
    return useResponseError('会话编号无效');
  }

  const conversation = MOCK_CHAT_CONVERSATIONS.find(
    (item) =>
      item.id === conversationId &&
      item.userId === userinfo.id &&
      item.tenantId === userinfo.tenantId &&
      !item.deleted,
  );

  if (!conversation) {
    setResponseStatus(event, 404);
    return useResponseError('会话不存在');
  }

  const messages = MOCK_CHAT_MESSAGES.filter(
    (item) => item.conversationId === conversationId,
  ).toSorted(
    (first, second) =>
      new Date(first.createTime).getTime() -
      new Date(second.createTime).getTime(),
  );

  return usePageResponseSuccess(page as string, pageSize as string, messages);
});
