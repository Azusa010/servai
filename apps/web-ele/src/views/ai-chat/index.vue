<script lang="ts" setup>
import type { ChatConversation, ChatMessage } from '#/api';

import { onBeforeUnmount, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import { ElButton, ElCard, ElEmpty, ElInput, ElMessage } from 'element-plus';

import {
  askChatStreamApi,
  createChatConversationApi,
  getChatConversationListApi,
  getChatMessageListApi,
} from '#/api';

const loading = ref(false);
const conversations = ref<ChatConversation[]>([]);
const activeConversationId = ref<number>();
const messagesLoading = ref(false);
const messages = ref<ChatMessage[]>([]);
const question = ref('');
const sending = ref(false);

let stopCurrentStream: (() => void) | undefined;

async function loadConversations() {
  loading.value = true;

  try {
    const result = await getChatConversationListApi({
      page: 1,
      pageSize: 50,
    });

    conversations.value = result.items;

    if (!activeConversationId.value && result.items[0]) {
      await handleSelectConversation(result.items[0].id);
    }
  } finally {
    loading.value = false;
  }
}

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

function handleStop() {
  stopCurrentStream?.();
  stopCurrentStream = undefined;
  sending.value = false;
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
  sending.value = true;

  const request = askChatStreamApi(
    {
      conversationId,
      question: content,
    },
    {
      onCitations(items) {
        assistantMessage.citations = items;
      },
      onDelta(delta) {
        assistantMessage.content += delta;
      },
      onDone(messageId) {
        assistantMessage.id = messageId;
      },
    },
  );

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
      void loadConversations();
    });
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
          <ElEmpty
            v-if="conversations.length === 0"
            :image-size="60"
            description="暂无会话"
          />

          <ElButton
            v-for="item in conversations"
            :key="item.id"
            class="mb-2 w-full"
            :type="activeConversationId === item.id ? 'primary' : 'default'"
            @click="handleSelectConversation(item.id)"
          >
            {{ item.title }}
          </ElButton>
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
              v-for="message in messages"
              :key="message.id"
              shadow="never"
            >
              <div>
                {{ message.role === 'user' ? '用户' : 'AI 助手' }}
              </div>

              <div class="mt-2 whitespace-pre-wrap">
                {{ message.content }}
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
            @keyup.ctrl.enter="handleSend"
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
