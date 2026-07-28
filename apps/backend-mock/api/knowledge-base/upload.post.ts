import { eventHandler, readMultipartFormData, setResponseStatus } from 'h3';
import { verifyAccessToken } from '~/utils/jwt-utils';
import {
  MOCK_KNOWLEDGE_BASES,
  MOCK_KNOWLEDGE_DOCUMENTS,
} from '~/utils/mock-data';
import {
  unAuthorizedResponse,
  useResponseError,
  useResponseSuccess,
} from '~/utils/response';

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const parts = await readMultipartFormData(event);
  const filePart = parts?.find((part) => part.name === 'file' && part.filename);
  const knowledgeBaseIdPart = parts?.find(
    (part) => part.name === 'knowledgeBaseId',
  );

  const knowledgeBaseId = Number(knowledgeBaseIdPart?.data.toString());

  if (!filePart?.filename || !Number.isInteger(knowledgeBaseId)) {
    setResponseStatus(event, 400);
    return useResponseError('文件或知识库编号无效');
  }

  const knowledgeBase = MOCK_KNOWLEDGE_BASES.find(
    (item) =>
      item.id === knowledgeBaseId && item.tenantId === userinfo.tenantId,
  );

  if (!knowledgeBase) {
    setResponseStatus(event, 404);
    return useResponseError('知识库不存在');
  }

  const document = {
    createTime: new Date().toISOString(),
    createdBy: userinfo.id,
    id: Math.max(...MOCK_KNOWLEDGE_DOCUMENTS.map((item) => item.id), 0) + 1,
    knowledgeBaseId,
    mimeType: filePart.type || 'application/octet-stream',
    name: filePart.filename,
    size: filePart.data.length,
    status: 'parsing',
    tenantId: userinfo.tenantId,
  } as const;

  MOCK_KNOWLEDGE_DOCUMENTS.push(document);

  setTimeout(() => {
    const currentDocument = MOCK_KNOWLEDGE_DOCUMENTS.find(
      (item) => item.id === document.id,
    );

    if (currentDocument?.status === 'parsing') {
      currentDocument.status = 'pending_publish';
    }
  }, 3000);

  return useResponseSuccess(document);
});
