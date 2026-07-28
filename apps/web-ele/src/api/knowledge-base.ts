import { requestClient } from '#/api/request';

export interface KnowledgeBase {
  description: string;
  id: number;
  name: string;
  status: 'disabled' | 'enabled';
  tenantId: number;
}

export interface KnowledgeBaseListResult {
  items: KnowledgeBase[];
  total: number;
}

export function getKnowledgeBaseListApi(params: {
  name?: string;
  page: number;
  pageSize: number;
  status?: KnowledgeBase['status'];
}) {
  return requestClient.get<KnowledgeBaseListResult>('/knowledge-base/list', {
    params,
  });
}

export function createKnowledgeBaseApi(data: {
  description?: string;
  name: string;
  status?: KnowledgeBase['status'];
}) {
  return requestClient.post<KnowledgeBase>('/knowledge-base/create', data);
}

export function uploadKnowledgeBaseFileApi(
  knowledgeBaseId: number,
  file: File,
) {
  return requestClient.upload<{ url: string }>('/upload', {
    file,
    knowledgeBaseId,
  });
}
