import { eventHandler } from 'h3';
import { verifyAccessToken } from '~/utils/jwt-utils';
import { MOCK_USERS } from '~/utils/mock-data';
import { unAuthorizedResponse, useResponseSuccess } from '~/utils/response';

export default eventHandler((event) => {
  const userinfo = verifyAccessToken(event);

  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const users = MOCK_USERS.filter(
    (item) => item.tenantId === userinfo.tenantId,
  ).map((item) => ({
    id: item.id,
    realName: item.realName,
  }));

  return useResponseSuccess(users);
});
