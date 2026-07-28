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
