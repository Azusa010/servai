import type { UserInfo } from '@vben/types';

import { requestClient } from '#/api/request';

export interface UserOption {
  deptId: number;
  deptName: string;
  id: number;
  realName: string;
}
export async function getUserOptionsApi() {
  return requestClient.get<UserOption[]>('/user/options');
}

/**
 * 获取用户信息
 */
export async function getUserInfoApi() {
  return requestClient.get<UserInfo>('/user/info');
}
