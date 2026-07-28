import { eventHandler, readBody, setResponseStatus } from 'h3';
import { verifyAccessToken } from '~/utils/jwt-utils';
import { MOCK_KNOWLEDGE_DOCUMENTS } from '~/utils/mock-data';
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

  const body = await readBody(event);
  const id = Number(body?.id);

  if (!Number.isInteger(id)) {
    setResponseStatus(event, 400);
    return useResponseError('文档编号无效');
  }

  const document = MOCK_KNOWLEDGE_DOCUMENTS.find(
    (item) => item.id === id && item.tenantId === userinfo.tenantId,
  );

  if (!document) {
    setResponseStatus(event, 404);
    return useResponseError('文档不存在');
  }

  if (document.status !== 'pending_publish') {
    setResponseStatus(event, 409);
    return useResponseError('只有待发布文档可以发布');
  }

  document.status = 'published';

  return useResponseSuccess(document);
});
