<script lang="ts" setup>
import type { ChatConversation, ChatMessage } from '#/api';

import { onBeforeUnmount, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import { useDebounceFn } from '@vueuse/core';
import {
  ElButton,
  ElCard,
  ElEmpty,
  ElInput,
  ElMessage,
  ElPopconfirm,
  ElTag,
} from 'element-plus';

import {
  askChatStreamApi,
  createChatConversationApi,
  deleteChatConversationApi,
  getChatConversationListApi,
  getChatMessageListApi,
} from '#/api';

import Icon from '../../../../../packages/@core/ui-kit/shadcn-ui/src/components/icon/icon.vue';

const loading = ref(false);
const conversations = ref<ChatConversation[]>([]);
const activeConversationId = ref<number>();
const messagesLoading = ref(false);
const messages = ref<ChatMessage[]>([]);
const question = ref('');
const sending = ref(false);
const keyword = ref('');

let stopCurrentStream: (() => void) | undefined;

async function loadConversations() {
  loading.value = true;

  try {
    const result = await getChatConversationListApi({
      page: 1,
      pageSize: 50,
      keyword: keyword.value.trim() || undefined,
    });

    conversations.value = result.items;

    if (!activeConversationId.value && result.items[0]) {
      await handleSelectConversation(result.items[0].id);
    }
  } finally {
    loading.value = false;
  }
}

const handleSearch = useDebounceFn(() => {
  void loadConversations();
}, 300);

async function handleSelectConversation(conversationId: number) {
  handleStop();
  activeConversationId.value = conversationId;
  messagesLoading.value = true;

  try {
    const result = await getChatMessageListApi({
      conversationId,
      page: 1,
      pageSize: 50,
    });

    messages.value = result.items;
  } finally {
    messagesLoading.value = false;
  }
}

async function handleCreateConversation() {
  handleStop();
  const conversation = await createChatConversationApi();

  conversations.value.unshift(conversation);
  activeConversationId.value = conversation.id;
  messages.value = [];
}

async function handleDeleteConversation(conversationId: number) {
  if (sending.value) {
    return;
  }

  const deletingActive = activeConversationId.value === conversationId;

  await deleteChatConversationApi({ id: conversationId });

  conversations.value = conversations.value.filter(
    (item) => item.id !== conversationId,
  );

  if (deletingActive) {
    activeConversationId.value = undefined;
    messages.value = [];
    question.value = '';

    const nextConversation = conversations.value[0];

    if (nextConversation) {
      await handleSelectConversation(nextConversation.id);
    }
  }
  ElMessage.success('会话已删除');
}

function handleStop() {
  stopCurrentStream?.();
  stopCurrentStream = undefined;
  sending.value = false;
}

function startAssistantStream(
  data: {
    conversationId: number;
    question?: string;
    regenerate?: boolean;
  },
  assistantMessage: ChatMessage,
) {
  sending.value = true;
  const request = askChatStreamApi(data, {
    onCitations(items) {
      assistantMessage.citations = items;
    },
    onDelta(delta) {
      assistantMessage.content += delta;
    },
    onDone(messageId) {
      assistantMessage.id = messageId;
    },
  });

  stopCurrentStream = request.abort;

  void request.promise
    .catch((error) => {
      if (error?.name !== 'AbortError') {
        ElMessage.error('问答请求失败');
      }
    })
    .finally(() => {
      sending.value = false;
      stopCurrentStream = undefined;
    });
}

function handleSend() {
  const conversationId = activeConversationId.value;
  const content = question.value.trim();

  if (!conversationId || !content || sending.value) {
    return;
  }

  const createTime = new Date().toISOString();

  const userMessage: ChatMessage = {
    citations: [],
    content,
    conversationId,
    createTime,
    id: -Date.now(),
    role: 'user',
  };

  const assistantMessage: ChatMessage = {
    citations: [],
    content: '',
    conversationId,
    createTime,
    id: -Date.now() - 1,
    role: 'assistant',
  };

  messages.value.push(userMessage, assistantMessage);
  question.value = '';

  const activeConversation = conversations.value.find(
    (item) => item.id === conversationId,
  );

  if (activeConversation?.title === '新会话') {
    activeConversation.title = content.slice(0, 20);
  }

  startAssistantStream(
    {
      conversationId,
      question: content,
    },
    assistantMessage,
  );
}

function handleRegenerate(message: ChatMessage) {
  const conversationId = activeConversationId.value;

  if (!conversationId || sending.value || message.role !== 'assistant') {
    return;
  }

  message.content = '';
  message.citations = [];

  startAssistantStream(
    {
      conversationId,
      regenerate: true,
    },
    message,
  );
}

onBeforeUnmount(handleStop);
onMounted(loadConversations);
</script>

<template>
  <Page>
    <div class="flex min-h-[600px] gap-4">
      <ElCard class="w-72 shrink-0">
        <template #header>
          <div class="flex items-center justify-between">
            <span>会话历史</span>
            <ElButton type="primary" @click="handleCreateConversation">
              新建
            </ElButton>
          </div>
        </template>

        <div v-loading="loading">
          <ElInput
            v-model="keyword"
            class="mb-3"
            clearable
            placeholder="搜索历史会话"
            @input="handleSearch"
          />

          <ElEmpty
            v-if="conversations.length === 0"
            :image-size="60"
            description="暂无会话"
          />

          <div
            v-for="item in conversations"
            :key="item.id"
            class="mb-2 flex items-center overflow-hidden rounded-md border transition-colors"
            :class="
              activeConversationId === item.id
                ? 'border-[var(--el-color-primary)] bg-[var(--el-color-primary)] text-white'
                : 'border-[var(--el-border-color)] bg-[var(--el-bg-color)] text-[var(--el-text-color-regular)] hover:border-[var(--el-color-primary)]'
            "
          >
            <button
              type="button"
              class="min-w-0 flex-1 truncate px-3 py-2 text-left"
              @click="handleSelectConversation(item.id)"
            >
              {{ item.title }}
            </button>

            <ElPopconfirm
              title="确定删除这个会话吗？"
              confirm-button-text="删除"
              cancel-button-text="取消"
              @confirm="handleDeleteConversation(item.id)"
            >
              <template #reference>
                <button
                  type="button"
                  :disabled="sending"
                  :aria-label="`删除会话：${item.title}`"
                  class="flex shrink-0 items-center self-stretch px-3 transition-colors hover:text-[var(--el-color-danger)] disabled:cursor-not-allowed disabled:opacity-50"
                  @click.stop
                >
                  <Icon class="size-4" icon="carbon:trash-can" />
                </button>
              </template>
            </ElPopconfirm>
          </div>
        </div>
      </ElCard>

      <ElCard class="flex-1">
        <ElEmpty
          v-if="!activeConversationId"
          description="新建或选择一个会话"
        />

        <div v-else v-loading="messagesLoading">
          <ElEmpty v-if="messages.length === 0" description="暂无消息" />

          <div v-else class="space-y-3">
            <ElCard
              v-for="(message, index) in messages"
              :key="message.id"
              shadow="never"
            >
              <div>
                {{ message.role === 'user' ? '用户' : 'AI 助手' }}
              </div>

              <div class="mt-2 whitespace-pre-wrap">
                {{ message.content }}
              </div>
              <div
                v-if="
                  message.role === 'assistant' && message.citations.length > 0
                "
                class="mt-3 border-t pt-3"
              >
                <div class="mb-2 text-sm">引用来源</div>
                <div class="flex flex-wrap gap-2">
                  <ElTag
                    v-for="citation in message.citations"
                    :key="citation.documentId"
                    :title="citation.content"
                    type="info"
                  >
                    {{ citation.knowledgeBaseName }} /
                    {{ citation.documentName }}
                  </ElTag>
                </div>
              </div>
              <div
                v-if="
                  message.role === 'assistant' &&
                  index === messages.length - 1 &&
                  !sending
                "
                class="mt-3"
              >
                <ElButton
                  link
                  type="primary"
                  @click="handleRegenerate(message)"
                >
                  <Icon icon="carbon:redo" />
                  重新生成
                </ElButton>
              </div>
            </ElCard>
          </div>
        </div>
        <div v-if="activeConversationId" class="mt-4 border-t pt-4">
          <ElInput
            v-model="question"
            :disabled="sending"
            :rows="3"
            placeholder="请输入问题"
            type="textarea"
            @keyup.enter="handleSend"
          />

          <div class="mt-3 flex justify-end">
            <ElButton v-if="sending" type="danger" @click="handleStop">
              停止生成
            </ElButton>

            <ElButton
              v-else
              :disabled="!question.trim()"
              type="primary"
              @click="handleSend"
            >
              发送
            </ElButton>
          </div>
        </div>
      </ElCard>
    </div>
  </Page>
</template>

<style scoped>
.el-button + .el-button {
  margin-left: 0px;
}
</style>
