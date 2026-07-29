import { eventHandler, readBody, setResponseStatus } from 'h3';

import { verifyAccessToken } from '~/utils/jwt-utils';
import { MOCK_CHAT_CONVERSATIONS } from '~/utils/mock-data';
import {
  unAuthorizedResponse,
  useResponseError,
  useResponseSuccess,
} from '~/utils/response';

export default eventHandler(async (event) => {
  const userInfo = verifyAccessToken(event);
  if (!userInfo) {
    return unAuthorizedResponse(event);
  }

  const body = await readBody(event);
  const id = Number(body?.id);

  if (!Number.isInteger(id)) {
    setResponseStatus(event, 400);
    return useResponseError('会话编号无效');
  }

  const conversation = MOCK_CHAT_CONVERSATIONS.find(
    (item) =>
      item.id === id &&
      item.tenantId === userInfo.tenantId &&
      item.userId === userInfo.id &&
      !item.deleted,
  );

  if(!conversation){
    setResponseStatus(event, 404);
    return useResponseError('会话不存在');
  }

  conversation.deleted = true;
  conversation.updateTime = new Date().toISOString();

  return useResponseSuccess('会话已删除');
});
