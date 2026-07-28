<script lang="ts" setup>
import type { KnowledgeBase, KnowledgeDocument } from '#/api';

import { onBeforeMount, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import type { UploadUserFile } from 'element-plus';

import {
  dayjs,
  ElButton,
  ElCard,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElOption,
  ElPagination,
  ElSelect,
  ElTable,
  ElTag,
  ElUpload,
} from 'element-plus';

import {
  createKnowledgeBaseApi,
  getKnowledgeBaseListApi,
  uploadKnowledgeBaseFileApi,
  getKnowledgeDocumentListApi,
} from '#/api';

const loading = ref(false);
const list = ref<KnowledgeBase[]>([]);
const page = ref(1);
const pageSize = ref(20);
const total = ref(0);
const name = ref('');
const status = ref<KnowledgeBase['status']>();
const createVisible = ref(false);
const createLoading = ref(false);
const createName = ref('');
const createDescription = ref('');
const createStatus = ref<KnowledgeBase['status']>('enabled');
const createFiles = ref<UploadUserFile[]>([]);
const documentVisible = ref(false);
const documentLoading = ref(false);
const documentList = ref<KnowledgeDocument[]>([]);
const documentKnowledgeBaseName = ref('');

const documentStatusMap = {
  archived: { text: '已归档', type: 'info' },
  failed: { text: '处理失败', type: 'danger' },
  parsing: { text: '解析中', type: 'warning' },
  pending_publish: { text: '待发布', type: 'primary' },
  published: { text: '已发布', type: 'success' },
  uploading: { text: '上传中', type: 'warning' },
} as const;

let documentRefreshTimer: ReturnType<typeof setTimeout> | undefined;

function stopDocumentRefresh() {
  if (documentRefreshTimer) {
    clearTimeout(documentRefreshTimer);
    documentRefreshTimer = undefined;
  }
}

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

function handleCreate() {
  createName.value = '';
  createDescription.value = '';
  createStatus.value = 'enabled';
  createFiles.value = [];
  createVisible.value = true;
}

async function handleCreateSubmit() {
  const newName = createName.value.trim();

  if (!newName) {
    ElMessage.warning('请输入知识库名称');
    return;
  }

  createLoading.value = true;

  try {
    const knowledgeBase = await createKnowledgeBaseApi({
      name: newName,
      description: createDescription.value.trim(),
      status: createStatus.value,
    });

    const file = createFiles.value[0]?.raw;

    if (file) {
      await uploadKnowledgeBaseFileApi(knowledgeBase.id, file);
    }

    ElMessage.success('创建成功');
    createVisible.value = false;
    page.value = 1;
    await loadData();
  } finally {
    createLoading.value = false;
  }
}

async function handleViewDocuments(row: KnowledgeBase, refresh = false) {
  if (!refresh) {
    stopDocumentRefresh();
    documentVisible.value = true;
    documentLoading.value = true;
    documentKnowledgeBaseName.value = row.name;
    documentList.value = [];
  }

  try {
    const result = await getKnowledgeDocumentListApi({
      knowledgeBaseId: row.id,
      page: 1,
      pageSize: 20,
    });
    documentList.value = result.items;

    if (result.items.some((item) => item.status === 'parsing')) {
      documentRefreshTimer = setTimeout(() => {
        if (documentVisible.value) {
          void handleViewDocuments(row, true);
        }
      }, 1000);
    } else {
      stopDocumentRefresh();
    }
  } catch {
    documentList.value = [];
    stopDocumentRefresh();
  } finally {
    if (!refresh) {
      documentLoading.value = false;
    }
  }
}

onBeforeMount(stopDocumentRefresh);
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
        <ElButton type="success" @click="handleCreate">新增</ElButton>
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
        <ElTable.TableColumn label="操作" width="100">
          <template #default="{ row }">
            <ElButton
              link
              type="primary"
              @click="handleViewDocuments(row as KnowledgeBase)"
            >
              文档
            </ElButton>
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

    <ElDialog v-model="createVisible" title="新增知识库" width="500px">
      <ElForm label-width="80px">
        <ElFormItem label="名称">
          <ElInput
            v-model="createName"
            maxlength="50"
            placeholder="请输入知识库名称"
          />
        </ElFormItem>

        <ElFormItem label="说明">
          <ElInput
            v-model="createDescription"
            :rows="3"
            maxlength="200"
            placeholder="请输入知识库说明"
            type="textarea"
          />
        </ElFormItem>

        <ElFormItem label="状态">
          <ElSelect v-model="createStatus">
            <ElOption label="启用" value="enabled" />
            <ElOption label="停用" value="disabled" />
          </ElSelect>
        </ElFormItem>

        <ElFormItem label="文件">
          <ElUpload
            v-model:file-list="createFiles"
            :auto-upload="false"
            :limit="1"
            accept=".pdf,.doc,.docx,.txt,.md"
          >
            <ElButton>选择文件</ElButton>

            <template #tip> 支持 PDF、Word、TXT 和 Markdown 文件 </template>
          </ElUpload>
        </ElFormItem>
      </ElForm>

      <template #footer>
        <ElButton @click="createVisible = false">取消</ElButton>
        <ElButton
          :loading="createLoading"
          type="primary"
          @click="handleCreateSubmit"
        >
          保存
        </ElButton>
      </template>
    </ElDialog>
    <ElDialog
      v-model="documentVisible"
      :title="`${documentKnowledgeBaseName} - 文档`"
      width="800px"
      @close="stopDocumentRefresh"
    >
      <ElTable v-loading="documentLoading" :data="documentList">
        <ElTable.TableColumn label="文件名" prop="name" />
        <ElTable.TableColumn label="类型" prop="mimeType" />
        <ElTable.TableColumn label="大小（字节）" prop="size" />
        <ElTable.TableColumn label="状态">
          <template #default="{ row }">
            <ElTag
              :type="
                documentStatusMap[row.status as keyof typeof documentStatusMap]
                  .type
              "
            >
              {{
                documentStatusMap[row.status as keyof typeof documentStatusMap]
                  .text
              }}
            </ElTag>
          </template>
        </ElTable.TableColumn>
        <ElTable.TableColumn
          label="上传时间"
          :formatter="
            (row) => dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss')
          "
        />
      </ElTable>
    </ElDialog>
  </Page>
</template>
