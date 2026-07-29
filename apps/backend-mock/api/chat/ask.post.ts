import {
  createEventStream,
  eventHandler,
  readBody,
  setResponseStatus,
  setResponseHeader,
} from 'h3';

import { verifyAccessToken } from '~/utils/jwt-utils';
import {
  MOCK_CHAT_CONVERSATIONS,
  MOCK_CHAT_MESSAGES,
  MOCK_KNOWLEDGE_BASES,
  MOCK_KNOWLEDGE_DOCUMENTS,
  type ChatCitationInfo,
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

  const body = await readBody<{
    conversationId?: unknown;
    question?: unknown;
    regenerate?: unknown;
  }>(event);

  const conversationId = Number(body?.conversationId);
  const inputQuestion =
    typeof body?.question === 'string' ? body.question.trim() : '';
  const regenerate = body?.regenerate === true;

  if (!Number.isInteger(conversationId) || (!regenerate && !inputQuestion)) {
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

  const lastUserMessageIndex = regenerate
    ? MOCK_CHAT_MESSAGES.findLastIndex(
        (item) =>
          item.conversationId === conversationId && item.role === 'user',
      )
    : -1;

  const question = regenerate
    ? (MOCK_CHAT_MESSAGES[lastUserMessageIndex]?.content ?? '')
    : inputQuestion;

  if (!question) {
    setResponseStatus(event, 400);
    return useResponseError('没有可以重新生成的问题');
  }

  const replacedAssistantIndex =
    regenerate && lastUserMessageIndex >= 0
      ? MOCK_CHAT_MESSAGES.findIndex(
          (item, index) =>
            index > lastUserMessageIndex &&
            item.conversationId === conversationId &&
            item.role === 'assistant',
        )
      : -1;

  const citations: ChatCitationInfo[] = [];

  for (const document of MOCK_KNOWLEDGE_DOCUMENTS) {
    if (
      document.tenantId !== userinfo.tenantId ||
      document.status !== 'published'
    ) {
      continue;
    }

    const knowledgeBase = MOCK_KNOWLEDGE_BASES.find(
      (item) =>
        item.id === document.knowledgeBaseId &&
        item.tenantId === userinfo.tenantId &&
        item.status === 'enabled',
    );

    if (!knowledgeBase) {
      continue;
    }

    citations.push({
      content: `匹配到已发布文档「${document.name}」`,
      documentId: document.id,
      documentName: document.name,
      knowledgeBaseId: knowledgeBase.id,
      knowledgeBaseName: knowledgeBase.name,
    });

    if (citations.length >= 3) {
      break;
    }
  }

  const currentTime = new Date().toISOString();
  if (!regenerate) {
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
  }
  conversation.updateTime = currentTime;

  const eventStream = createEventStream(event);
  let closed = false;

  eventStream.onClosed(() => {
    closed = true;
  });

  const chunks =
    citations.length > 0
      ? [
          `已检索到 ${citations.length} 个相关文档：`,
          citations.map((item) => item.documentName).join('、'),
          `。关于“${question}”，当前为 Mock 流式回答。`,
        ]
      : ['当前没有可检索的已发布文档，暂时无法根据知识库回答。'];

  void (async () => {
    await eventStream.push({
      data: JSON.stringify({ items: citations }),
      event: 'citations',
    });

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
      if (replacedAssistantIndex >= 0) {
        MOCK_CHAT_MESSAGES.splice(replacedAssistantIndex, 1);
      }

      const assistantMessage: ChatMessageInfo = {
        citations,
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

  const sendPromise = eventStream.send();

  setResponseHeader(event, 'Connection', 'close');

  return sendPromise;
});
