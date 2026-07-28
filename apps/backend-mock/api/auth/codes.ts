import { eventHandler } from 'h3';
import { verifyAccessToken } from '~/utils/jwt-utils';
import { MOCK_CODES } from '~/utils/mock-data';
import { unAuthorizedResponse, useResponseSuccess } from '~/utils/response';

export default eventHandler((event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const codes =
    MOCK_CODES.find(
      (item) =>
        item.userId === userinfo.id && item.tenantId === userinfo.tenantId,
    )?.codes ?? [];

  return useResponseSuccess(codes);
});
