import { eventHandler } from 'h3';
import { verifyAccessToken } from '~/utils/jwt-utils';
import { MOCK_MENUS } from '~/utils/mock-data';
import { unAuthorizedResponse, useResponseSuccess } from '~/utils/response';

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const menus =
    MOCK_MENUS.find(
      (item) =>
        item.userId === userinfo.id && item.tenantId === userinfo.tenantId,
    )?.menus ?? [];
  return useResponseSuccess(menus);
});
