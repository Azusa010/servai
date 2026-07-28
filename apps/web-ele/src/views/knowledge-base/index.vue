<script lang="ts" setup>
import type { KnowledgeBase } from '#/api';

import { onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import {
  ElButton,
  ElCard,
  ElInput,
  ElOption,
  ElPagination,
  ElSelect,
  ElTable,
  ElTag,
} from 'element-plus';

import { getKnowledgeBaseListApi } from '#/api';

const loading = ref(false);
const list = ref<KnowledgeBase[]>([]);
const page = ref(1);
const pageSize = ref(20);
const total = ref(0);
const name = ref('');
const status = ref<KnowledgeBase['status']>();

async function loadData() {
  loading.value = true;
  try {
    const result = await getKnowledgeBaseListApi({
      name: name.value,
      status: status.value,
      page: page.value,
      pageSize: pageSize.value,
    });

    list.value = result.items;
    total.value = result.total;
  } catch {
    list.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  page.value = 1;
  loadData();
}

onMounted(loadData);
</script>

<template>
  <Page>
    <ElCard>
      <div class="mb-4 flex gap-3">
        <ElInput
          v-model="name"
          clearable
          placeholder="请输入知识库名称"
          style="width: 240px"
          @keyup.enter="handleSearch"
        />

        <ElSelect
          v-model="status"
          clearable
          placeholder="请选择状态"
          style="width: 160px"
        >
          <ElOption label="启用" value="enabled" />
          <ElOption label="停用" value="disabled" />
        </ElSelect>
        <ElButton type="primary" @click="handleSearch">查询</ElButton>
      </div>
      <ElTable v-loading="loading" :data="list">
        <ElTable.TableColumn label="名称" prop="name" />
        <ElTable.TableColumn label="说明" prop="description" />
        <ElTable.TableColumn label="状态">
          <template #default="{ row }">
            <ElTag :type="row.status === 'enabled' ? 'success' : 'info'">
              {{ row.status === 'enabled' ? '启用' : '停用' }}
            </ElTag>
          </template>
        </ElTable.TableColumn>
      </ElTable>
      <div class="mt-4 flex justify-center">
        <ElPagination
          v-model:current-page="page"
          :page-size="pageSize"
          :total="total"
          layout="total, prev, pager, next"
          @current-change="loadData"
        />
      </div>
    </ElCard>
  </Page>
</template>
