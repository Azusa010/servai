import { defineEventHandler, readBody, setResponseStatus } from 'h3';
import {
  clearRefreshTokenCookie,
  setRefreshTokenCookie,
} from '~/utils/cookie-utils';
import { generateAccessToken, generateRefreshToken } from '~/utils/jwt-utils';
import { MOCK_TENANTS, MOCK_USERS } from '~/utils/mock-data';
import {
  forbiddenResponse,
  useResponseError,
  useResponseSuccess,
} from '~/utils/response';

export default defineEventHandler(async (event) => {
  const { password, tenantCode, username } = await readBody(event);
  if (
    typeof password !== 'string' ||
    !password ||
    typeof username !== 'string' ||
    !username.trim() ||
    typeof tenantCode !== 'string' ||
    !tenantCode.trim()
  ) {
    setResponseStatus(event, 400);
    return useResponseError(
      'BadRequestException',
      'Tenant code, username and password are required.',
    );
  }

  const tenant = MOCK_TENANTS.find(
    (item) => item.code === tenantCode.trim() && item.status === 'active',
  );

  if (!tenant) {
    clearRefreshTokenCookie(event);
    return forbiddenResponse(
      event,
      'Tenant, username or password is incorrect.',
    );
  }

  const findUser = MOCK_USERS.find(
    (item) =>
      item.username === username.trim() &&
      item.password === password &&
      item.tenantId === tenant.id,
  );

  if (!findUser) {
    clearRefreshTokenCookie(event);
    return forbiddenResponse(event, 'Username or password is incorrect.');
  }

  const accessToken = generateAccessToken(findUser);
  const refreshToken = generateRefreshToken(findUser);

  setRefreshTokenCookie(event, refreshToken);

  return useResponseSuccess({
    accessToken,
  });
});
