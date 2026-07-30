import type { CreateTicketParams, TicketDetail } from '#/api';

import { reactive, ref } from 'vue';

import { ElMessage } from 'element-plus';

import { createTicketApi } from '#/api';

type CreateSuccessHandler = (ticket: TicketDetail) => Promise<void> | void;

function createInitialForm(): CreateTicketParams {
  return {
    consumer: {
      contactName: '',
      customerName: '',
      email: '',
      phone: '',
    },
    description: '',
    priority: 'P2',
    slaDeadline: '',
    title: '',
    type: 'consult',
  };
}

export function useTicketCreate(onSuccess?: CreateSuccessHandler) {
  const createForm = reactive<CreateTicketParams>(createInitialForm());

  const createVisible = ref(false);
  const creating = ref(false);

  function openCreate() {
    Object.assign(createForm, createInitialForm());
    createVisible.value = true;
  }

  async function submitCreate() {
    if (creating.value) {
      return;
    }

    creating.value = true;

    try {
      const ticket = await createTicketApi({
        ...createForm,
        consumer: { ...createForm.consumer },
      });

      await onSuccess?.(ticket);
      createVisible.value = false;
      ElMessage.success('工单创建成功');

      return ticket;
    } catch {
      ElMessage.error('工单创建失败');
    } finally {
      creating.value = false;
    }
  }

  return {
    createForm,
    createVisible,
    creating,
    openCreate,
    submitCreate,
  };
}
