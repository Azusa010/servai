<script lang="ts" setup>
import type {
  TicketDetail,
  TicketListItem,
  TicketPriority,
  TicketStatus,
  UserOption,
} from '#/api';

import { onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import {
  ElCard,
  ElDrawer,
  ElDescriptions,
  ElDescriptionsItem,
  ElDivider,
  ElMessage,
  ElPagination,
  ElTable,
  ElTableColumn,
  ElButton,
  ElInput,
  ElOption,
  ElSelect,
  ElTag,
  ElTimeline,
  ElTimelineItem,
} from 'element-plus';

import { getTicketDetailApi, getTicketListApi, getUserOptionsApi } from '#/api';

import { useTicketOperation } from './use-ticket-operation';

const loading = ref(false);
const list = ref<TicketListItem[]>([]);
const page = ref(1);
const pageSize = ref(20);
const total = ref(0);
const keyword = ref('');
const priority = ref<TicketPriority>();
const status = ref<TicketStatus>();
const assigneeId = ref<number>();
const detailLoading = ref(false);
const detailVisible = ref(false);
const ticketDetail = ref<TicketDetail>();

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

const userOptions = ref<UserOption[]>([]);

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

const ticketActionMap = {
  cancel: '取消工单',
  claim: '领取工单',
  close: '关闭工单',
  confirm: '确认解决',
  create: '创建工单',
  resolve: '标记解决',
  resume: '恢复处理',
  suspend: '挂起工单',
  transfer: '转交工单',
} as const;

function getOperatorName(actorId: null | number) {
  if (actorId === null) {
    return '系统';
  }
  return getPICName(actorId);
}

function formatTime(value: string) {
  return new Date(value).toLocaleString('zh-CN', {
    hour12: false,
  });
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

async function handleRowClick(row: TicketListItem) {
  detailVisible.value = true;
  detailLoading.value = true;
  ticketDetail.value = undefined;

  try {
    ticketDetail.value = await getTicketDetailApi(row.id);
  } catch {
    detailVisible.value = false;
    ElMessage.error('工单详情加载失败');
  } finally {
    detailLoading.value = false;
  }
}

function handlePageChange() {
  loadData();
}

function handlePageSizeChange() {
  page.value = 1;
  loadData();
}

const { executeOperation, operating } = useTicketOperation(async (ticket) => {
  ticketDetail.value = ticket;
  await loadData();
});

async function handleClaim() {
  if (!ticketDetail.value) {
    return;
  }
  await executeOperation({
    action: 'claim',
    comment: '客服领取工单',
    id: ticketDetail.value.id,
  });
}

async function handleStatusOperation(action: 'resolve' | 'resume' | 'suspend') {
  if (!ticketDetail.value) {
    return;
  }
  await executeOperation({
    action,
    comment: ticketActionMap[action],
    id: ticketDetail.value.id,
  });
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
      <ElTable
        v-loading="loading"
        :data="list"
        row-key="id"
        @row-click="handleRowClick"
      >
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
    <ElDrawer
      v-model="detailVisible"
      :title="ticketDetail?.ticketNo ?? '工单详情'"
      size="420px"
    >
      <div v-loading="detailLoading">
        <template v-if="ticketDetail">
          <ElDescriptions :column="1" border title="工单信息">
            <ElDescriptionsItem label="标题">
              {{ ticketDetail.title }}
            </ElDescriptionsItem>

            <ElDescriptionsItem label="描述">
              {{ ticketDetail.description }}
            </ElDescriptionsItem>

            <ElDescriptionsItem label="优先级">
              <ElTag :type="ticketPriorityMap[ticketDetail.priority]">
                {{ ticketDetail.priority }}
              </ElTag>
            </ElDescriptionsItem>

            <ElDescriptionsItem label="状态">
              <ElTag :type="ticketStatusMap[ticketDetail.status].type">
                {{ ticketStatusMap[ticketDetail.status].text }}
              </ElTag>
            </ElDescriptionsItem>

            <ElDescriptionsItem label="负责人">
              {{ getPICName(ticketDetail.PICid) }}
            </ElDescriptionsItem>

            <ElDescriptionsItem label="创建时间">
              {{ formatTime(ticketDetail.createTime) }}
            </ElDescriptionsItem>

            <ElDescriptionsItem label="更新时间">
              {{ formatTime(ticketDetail.updateTime) }}
            </ElDescriptionsItem>

            <ElDescriptionsItem label="SLA 截止时间">
              {{ formatTime(ticketDetail.slaDeadline) }}
            </ElDescriptionsItem>
          </ElDescriptions>

          <ElDivider />

          <ElDescriptions :column="1" border title="客户信息">
            <ElDescriptionsItem label="客户名称">
              {{ ticketDetail.consumer.customerName }}
            </ElDescriptionsItem>

            <ElDescriptionsItem label="联系人">
              {{ ticketDetail.consumer.contactName }}
            </ElDescriptionsItem>

            <ElDescriptionsItem label="电话">
              {{ ticketDetail.consumer.phone }}
            </ElDescriptionsItem>

            <ElDescriptionsItem label="邮箱">
              {{ ticketDetail.consumer.email }}
            </ElDescriptionsItem>
          </ElDescriptions>
          <ElDivider />

          <h3 class="mb-4">处理进度</h3>

          <ElTimeline>
            <ElTimelineItem
              v-for="timeline in ticketDetail.timelines"
              :key="timeline.id"
              :timestamp="formatTime(timeline.actionTime)"
              placement="top"
              type="primary"
            >
              <div class="flex items-center gap-2">
                <strong>{{ ticketActionMap[timeline.action] }}</strong>

                <ElTag
                  size="small"
                  :type="ticketStatusMap[timeline.afterStatus].type"
                >
                  {{ ticketStatusMap[timeline.afterStatus].text }}
                </ElTag>
              </div>

              <div class="mt-2 text-sm">
                操作人：{{ getOperatorName(timeline.actorId) }}
              </div>

              <div v-if="timeline.comment" class="mt-1 text-sm">
                备注：{{ timeline.comment }}
              </div>
            </ElTimelineItem>
          </ElTimeline>
        </template>
      </div>
      <template #footer>
        <ElButton
          v-if="ticketDetail?.status === 'Unassigned'"
          :loading="operating"
          type="primary"
          @click="handleClaim"
        >
          领取工单
        </ElButton>
        <template v-if="ticketDetail?.status === 'Processing'">
          <ElButton
            :loading="operating"
            type="warning"
            @click="handleStatusOperation('suspend')"
          >
            挂起工单
          </ElButton>

          <ElButton
            :loading="operating"
            type="success"
            @click="handleStatusOperation('resolve')"
          >
            标记解决
          </ElButton>
        </template>
        <ElButton
          v-if="ticketDetail?.status === 'Suspended'"
          :loading="operating"
          type="primary"
          @click="handleStatusOperation('resume')"
        >
          恢复处理
        </ElButton>
      </template>
    </ElDrawer>
  </Page>
</template>
