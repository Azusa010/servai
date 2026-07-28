import { requestClient } from '#/api/request';

export interface KnowledgeBase {
  description: string;
  id: number;
  name: string;
  status: 'disabled' | 'enabled';
  tenantId: number;
}

export interface KnowledgeDocument {
  createTime: string;
  createdBy: number;
  id: number;
  knowledgeBaseId: number;
  mimeType: string;
  name: string;
  size: number;
  status:
    | 'archived'
    | 'failed'
    | 'parsing'
    | 'pending_publish'
    | 'published'
    | 'uploading';
  tenantId: number;
}

export interface KnowledgeBaseListResult {
  items: KnowledgeBase[];
  total: number;
}

export interface KnowledgeDocumentListResult {
  items: KnowledgeDocument[];
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
  return requestClient.upload<KnowledgeDocument>('/knowledge-base/upload', {
    file,
    knowledgeBaseId,
  });
}

export function getKnowledgeDocumentListApi(params: {
  knowledgeBaseId: number;
  page: number;
  pageSize: number;
}) {
  return requestClient.get<KnowledgeDocumentListResult>(
    '/knowledge-base/document/list',
    { params },
  );
}
