import { eventHandler, readBody } from 'h3';
import { verifyAccessToken } from '~/utils/jwt-utils';
import {
  MOCK_CHAT_CONVERSATIONS,
  type ChatConversationInfo,
} from '~/utils/mock-data';
import { unAuthorizedResponse, useResponseSuccess } from '~/utils/response';

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const body = await readBody<{ title?: unknown }>(event);

  const title =
    typeof body?.title === 'string' && body.title.trim()
      ? body.title.trim().slice(0, 50)
      : '新会话';

  const currentTime = new Date().toISOString();

  const conversation: ChatConversationInfo = {
    createTime: currentTime,
    deleted: false,
    id: Math.max(...MOCK_CHAT_CONVERSATIONS.map((item) => item.id), 0) + 1,
    tenantId: userinfo.tenantId,
    title,
    updateTime: currentTime,
    userId: userinfo.id,
  };

  MOCK_CHAT_CONVERSATIONS.push(conversation);

  return useResponseSuccess(conversation);
});
