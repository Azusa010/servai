import { eventHandler, getQuery, setResponseStatus } from 'h3';
import { verifyAccessToken } from '~/utils/jwt-utils';
import {
  MOCK_KNOWLEDGE_BASES,
  MOCK_KNOWLEDGE_DOCUMENTS,
} from '~/utils/mock-data';
import {
  unAuthorizedResponse,
  usePageResponseSuccess,
  useResponseError,
} from '~/utils/response';

export default eventHandler((event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const {
    knowledgeBaseId: knowledgeBaseIdQuery,
    page = 1,
    pageSize = 20,
  } = getQuery(event);

  const knowledgeBaseId = Number(knowledgeBaseIdQuery);

  if(!Number.isInteger(knowledgeBaseId)){
    setResponseStatus(event, 400);
    return useResponseError('知识库编号无效');
  }

  const knowledgeBase = MOCK_KNOWLEDGE_BASES.find(
    (item)=>
      item.id === knowledgeBaseId &&
    item.tenantId === userinfo.tenantId
  )

  if(!knowledgeBase){
    setResponseStatus(event, 404);
    return useResponseError('知识库不存在');
  }

  const listData = MOCK_KNOWLEDGE_DOCUMENTS.filter(
    (item)=>
      item.knowledgeBaseId === knowledgeBaseId &&
      item.tenantId === userinfo.tenantId
  )

  return usePageResponseSuccess(page as string,pageSize as string,listData)
});
