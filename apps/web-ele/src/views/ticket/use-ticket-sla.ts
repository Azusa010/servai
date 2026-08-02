import type { TicketSlaStatus } from '#/api';

import { useNow } from '@vueuse/core';

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function formatDuration(duration: number) {
  const totalMinutes = Math.max(1, Math.ceil(duration / MINUTE));
  const days = Math.floor(duration / DAY);
  const hours = Math.floor((duration % DAY) / HOUR);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return hours > 0 ? `${days}天${hours}小时` : `${days}天`;
  }

  if (hours > 0) {
    return minutes > 0 ? `${hours}小时${minutes}分钟` : `${hours}小时`;
  }

  return `${totalMinutes}分钟`;
}

export function useTicketSla() {
  const now = useNow({ interval: MINUTE });

  function formatSlaRemaining(deadlinge: string, status: TicketSlaStatus) {
    if (status === 'completed') {
      return '计时已结束';
    }
    if (status === 'paused') {
      return '计时已暂停';
    }

    const deadlineTime = new Date(deadlinge).getTime();

    if (Number.isNaN(deadlineTime)) {
      return '-';
    }

    const remainingTime = deadlineTime - now.value.getTime();
    const durationText = formatDuration(Math.abs(remainingTime));
    return remainingTime <= 0
      ? `已超时 ${durationText}`
      : `剩余 ${durationText}`;
  }
  return {
    formatSlaRemaining,
  };
}
