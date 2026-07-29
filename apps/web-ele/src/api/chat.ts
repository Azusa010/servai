import { requestClient } from '#/api/request';

export interface ChatCitation {
  content: string;
  documentId: number;
  documentName: string;
  knowledgeBaseId: number;
  knowledgeBaseName: string;
}

export interface ChatConversation {
  createTime: string;
  deleted: boolean;
  id: number;
  tenantId: number;
  title: string;
  updateTime: string;
  userId: number;
}

export interface ChatMessage {
  citations: ChatCitation[];
  content: string;
  conversationId: number;
  createTime: string;
  id: number;
  role: 'assistant' | 'user';
}

export interface ChatConversationListResult {
  items: ChatConversation[];
  total: number;
}

export interface ChatMessageListResult {
  items: ChatMessage[];
  total: number;
}

export function getChatConversationListApi(params: {
  keyword?: string;
  page: number;
  pageSize: number;
}) {
  return requestClient.get<ChatConversationListResult>(
    '/chat/conversation/list',
    { params },
  );
}

export function createChatConversationApi(data: { title?: string } = {}) {
  return requestClient.post<ChatConversation>(
    '/chat/conversation/create',
    data,
  );
}

export function getChatMessageListApi(params: {
  conversationId: number;
  page: number;
  pageSize: number;
}) {
  return requestClient.get<ChatMessageListResult>('/chat/message/list', {
    params,
  });
}

export interface ChatStreamCallbacks {
  onCitations?: (items: ChatCitation[]) => void;
  onDelta?: (content: string) => void;
  onDone?: (messageId: number) => void;
  onEnd?: () => void;
}

export function askChatStreamApi(
  data: {
    conversationId: number;
    question: string;
  },
  callbacks: ChatStreamCallbacks = {},
) {
  const controller = new AbortController();
  let buffer = '';

  function handleChunk(chunk: string) {
    buffer += chunk;

    const eventBlocks = buffer.split(/\r?\n\r?\n/);
    buffer = eventBlocks.pop() ?? '';

    for (const block of eventBlocks) {
      let eventName = '';
      const dataLines: string[] = [];

      for (const line of block.split(/\r?\n/)) {
        if (line.startsWith('event: ')) {
          eventName = line.slice(6).trim();
        }

        if (line.startsWith('data: ')) {
          dataLines.push(line.slice(5).trim());
        }
      }

      if (!eventName || dataLines.length === 0) {
        continue;
      }

      const payload = JSON.parse(dataLines.join('\n'));

      if (eventName === 'citations') {
        callbacks.onCitations?.(payload.items);
      }

      if (eventName === 'delta') {
        callbacks.onDelta?.(payload.content);
      }

      if (eventName === 'done') {
        callbacks.onDone?.(payload.messageId);
      }
    }
  }

  const promise = requestClient.postSSE('/chat/ask', data, {
    headers: {
      'Content-Type': 'application/json',
    },
    onEnd: callbacks.onEnd,
    onMessage: handleChunk,
    signal: controller.signal,
  });

  return {
    abort: () => controller.abort(),
    promise,
  };
}
