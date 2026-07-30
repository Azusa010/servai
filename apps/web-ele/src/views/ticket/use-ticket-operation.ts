import type { OperateTicketParams, TicketDetail } from '#/api';

import { ref } from 'vue';

import { ElMessage } from 'element-plus';

import { operateTicketApi } from '#/api';

type OperationSuccessHandler = (ticket: TicketDetail) => Promise<void> | void;

export function useTicketOperation(onSuccess?: OperationSuccessHandler) {
  const operating = ref(false);

  async function executeOperation(data: OperateTicketParams) {
    if (operating.value) {
      return;
    }

    operating.value = true;

    try {
      const ticket = await operateTicketApi(data);

      await onSuccess?.(ticket);
      ElMessage.success('工单操作成功');

      return ticket;
    } catch {
      ElMessage.error('工单操作失败');
    } finally {
      operating.value = false;
    }
  }

  return {
    executeOperation,
    operating,
  };
}
