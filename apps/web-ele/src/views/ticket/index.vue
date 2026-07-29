<script lang="ts" setup>
import type {
  TicketListItem,
  TicketPriority,
  TicketStatus,
  UserOption,
} from '#/api';

import { onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import {
  ElCard,
  ElMessage,
  ElPagination,
  ElTable,
  ElTableColumn,
  ElButton,
  ElInput,
  ElOption,
  ElSelect,
  ElTag,
} from 'element-plus';

import { getTicketListApi, getUserOptionsApi } from '#/api';

const loading = ref(false);
const list = ref<TicketListItem[]>([]);
const page = ref(1);
const pageSize = ref(20);
const total = ref(0);
const keyword = ref('');
const priority = ref<TicketPriority>();
const status = ref<TicketStatus>();
const assigneeId = ref<number>();
const userOptions = ref<UserOption[]>([]);

const ticketStatusMap = {
  Canceled: { text: '已取消', type: 'danger' },
  Closed: { text: '已关闭', type: 'success' },
  Pending_Confirmation: { text: '待确认', type: 'warning' },
  Processing: { text: '处理中', type: 'primary' },
  Suspended: { text: '已挂起', type: 'info' },
  Unassigned: { text: '待分配', type: 'info' },
} as const;

const ticketPriorityMap = {
  P1: 'danger',
  P2: 'warning',
  P3: 'success',
} as const;

async function loadUserOptions() {
  try {
    userOptions.value = await getUserOptionsApi();
  } catch {
    userOptions.value = [];
    ElMessage.error('负责人列表加载失败');
  }
}

function getPICName(picId: null | number) {
  if (picId === null) {
    return '未分配';
  }

  return (
    userOptions.value.find((item) => item.id === picId)?.realName ?? '未知用户'
  );
}

async function loadData() {
  loading.value = true;

  try {
    const result = await getTicketListApi({
      keyword: keyword.value,
      page: page.value,
      pageSize: pageSize.value,
      PICid: assigneeId.value,
      priority: priority.value,
      status: status.value,
    });

    list.value = result.items;
    total.value = result.total;
  } catch {
    list.value = [];
    total.value = 0;
    ElMessage.error('工单列表加载失败');
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  page.value = 1;
  loadData();
}

function handleReset() {
  keyword.value = '';
  priority.value = undefined;
  status.value = undefined;
  assigneeId.value = undefined;
  page.value = 1;
  loadData();
}

function handlePageChange() {
  loadData();
}

function handlePageSizeChange() {
  page.value = 1;
  loadData();
}

onMounted(() => {
  loadData();
  loadUserOptions();
});
</script>

<template>
  <Page description="统一管理客户工单" title="工单中心">
    <ElCard shadow="never">
      <div class="mb-4 flex gap-3">
        <ElInput
          v-model="keyword"
          clearable
          placeholder="搜索工单编号、标题或客户"
          @keyup.enter="handleSearch"
        />

        <ElSelect v-model="status" clearable placeholder="全部状态">
          <ElOption label="待分配" value="Unassigned" />
          <ElOption label="处理中" value="Processing" />
          <ElOption label="待确认" value="Pending_Confirmation" />
          <ElOption label="已挂起" value="Suspended" />
          <ElOption label="已关闭" value="Closed" />
          <ElOption label="已取消" value="Canceled" />
        </ElSelect>

        <ElSelect v-model="priority" clearable placeholder="全部优先级">
          <ElOption label="P1" value="P1" />
          <ElOption label="P2" value="P2" />
          <ElOption label="P3" value="P3" />
        </ElSelect>

        <ElSelect v-model="assigneeId" clearable placeholder="全部负责人">
          <ElOption
            v-for="user in userOptions"
            :key="user.id"
            :label="user.realName"
            :value="user.id"
          />
        </ElSelect>

        <ElButton type="primary" @click="handleSearch">查询</ElButton>
        <ElButton @click="handleReset">重置</ElButton>
      </div>
      <ElTable v-loading="loading" :data="list" row-key="id">
        <ElTableColumn label="工单编号" prop="ticketNo" />
        <ElTableColumn label="标题" prop="title" />
        <ElTableColumn label="客户" prop="consumer.customerName" />
        <ElTableColumn label="优先级">
          <template #default="{ row }">
            <ElTag :type="ticketPriorityMap[row.priority as TicketPriority]">
              {{ row.priority }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="状态">
          <template #default="{ row }">
            <ElTag :type="ticketStatusMap[row.status].type">
              {{ ticketStatusMap[row.status]?.text }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="负责人">
          <template #default="{ row }">
            {{ getPICName(row.PICid) }}
          </template>
        </ElTableColumn>
        <ElTableColumn label="更新时间" prop="updateTime" />
      </ElTable>

      <ElPagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        class="mt-4 justify-end"
        layout="total, sizes, prev, pager, next"
        :total="total"
        @current-change="handlePageChange"
        @size-change="handlePageSizeChange"
      />
    </ElCard>
  </Page>
</template>
