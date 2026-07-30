import type { OperateTicketParams, TicketDetail } from '#/api';

import { ref } from 'vue';

import { ElMessage } from 'element-plus';

type TicketOperationExecutor = (
  data: OperateTicketParams,
) => Promise<TicketDetail | undefined>;

export function useTicketTransfer(executeOperation: TicketOperationExecutor) {
  const currentPICid = ref<null | number>(null);
  const targetPICid = ref<number>();
  const transferVisible = ref(false);

  function openTransfer(PICid: null | number) {
    currentPICid.value = PICid;
    targetPICid.value = undefined;
    transferVisible.value = true;
  }

  async function submitTransfer(ticketId: number) {
    if (targetPICid.value === undefined) {
      ElMessage.warning('请选择新的负责人');
      return;
    }

    if (targetPICid.value === currentPICid.value) {
      ElMessage.warning('新负责人不能与当前负责人相同');
      return;
    }

    const ticket = await executeOperation({
      action: 'transfer',
      afterPICid: targetPICid.value,
      comment: '转交工单',
      id: ticketId,
    });

    if (ticket) {
      transferVisible.value = false;
    }
  }

  return {
    currentPICid,
    openTransfer,
    submitTransfer,
    targetPICid,
    transferVisible,
  };
}
