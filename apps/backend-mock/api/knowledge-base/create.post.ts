import { eventHandler, readBody, setResponseStatus } from 'h3';
import { verifyAccessToken } from '~/utils/jwt-utils';
import { MOCK_KNOWLEDGE_BASES } from '~/utils/mock-data';
import { unAuthorizedResponse, useResponseError, useResponseSuccess } from '~/utils/response';

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const body = await readBody<{
    description?: string;
    name?: unknown;
    status?: unknown;
  }>(event);

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const description =
    typeof body.description === 'string' ? body.description.trim() : '';

  if (!name) {
    setResponseStatus(event, 400);
    return useResponseError('名称不能为空');
  }

  const exists = MOCK_KNOWLEDGE_BASES.some(
    (item) =>
      item.tenantId === userinfo.tenantId &&
      item.name.toLowerCase() === name.toLowerCase(),
  );

  if (exists) {
    setResponseStatus(event, 400);
    return useResponseError('知识库名称已存在');
  }

  const knowledgeBase = {
    description,
    id: Math.max(...MOCK_KNOWLEDGE_BASES.map((item) => item.id), 0) + 1,
    name,
    status: body.status === 'enabled' ? 'enabled' : 'disabled',
    tenantId: userinfo.tenantId,
  } as const;

  MOCK_KNOWLEDGE_BASES.push(knowledgeBase);

  return useResponseSuccess(knowledgeBase);
});
