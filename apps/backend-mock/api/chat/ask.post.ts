import {
  createEventStream,
  eventHandler,
  readBody,
  setResponseStatus,
} from 'h3';

import { verifyAccessToken } from '~/utils/jwt-utils';
import {
  MOCK_CHAT_CONVERSATIONS,
  MOCK_CHAT_MESSAGES,
  type ChatMessageInfo,
} from '~/utils/mock-data';
import {
  sleep,
  unAuthorizedResponse,
  useResponseError,
} from '~/utils/response';

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const body = await readBody<{ conversationId?: unknown; question?: unknown }>(
    event,
  );

  const conversationId = Number(body.conversationId);
  const question =
    typeof body.question === 'string' ? body.question.trim() : '';

  if (!Number.isInteger(conversationId) || !question) {
    setResponseStatus(event, 400);
    return useResponseError('会话编号或问题无效');
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

  const currentTime = new Date().toISOString();

  const userMessage: ChatMessageInfo = {
    citations: [],
    content: question,
    conversationId,
    createTime: currentTime,
    id: Math.max(...MOCK_CHAT_MESSAGES.map((item) => item.id), 0) + 1,
    role: 'user',
  };

  MOCK_CHAT_MESSAGES.push(userMessage);

  if (conversation.title === '新会话') {
    conversation.title = question.slice(0, 20);
  }

  conversation.updateTime = currentTime;

  const eventStream = createEventStream(event);
  let closed = false;

  eventStream.onClosed(() => {
    closed = true;
  });

  const chunks = ['已收到你的问题: ', question, '。正在检索相关知识...'];

  void (async () => {
    for (const content of chunks) {
      await sleep(300);

      if (closed) {
        return;
      }

      await eventStream.push({
        data: JSON.stringify({ content }),
        event: 'delta',
      });
    }

    if (!closed) {
      const assistantMessage: ChatMessageInfo = {
        citations: [],
        content: chunks.join(''),
        conversationId,
        createTime: new Date().toISOString(),
        id: Math.max(...MOCK_CHAT_MESSAGES.map((item) => item.id), 0) + 1,
        role: 'assistant',
      };
      MOCK_CHAT_MESSAGES.push(assistantMessage);
      conversation.updateTime = assistantMessage.createTime;

      await eventStream.push({
        data: JSON.stringify({
          completed: true,
          messageId: assistantMessage.id,
        }),
        event: 'done',
      });

      await eventStream.close();
    }
  })();

  return eventStream.send();
});
