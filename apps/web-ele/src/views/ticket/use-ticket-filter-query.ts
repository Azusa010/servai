import type {
  TicketPriority,
  TicketSlaStatus,
  TicketStatus,
  TicketType,
} from '#/api';

import type { Ref } from 'vue';

import { useRoute, useRouter } from 'vue-router';

interface TicketFilterRefs {
  assigneeId: Ref<number | undefined>;
  createTimeRange: Ref<[string, string] | undefined>;
  keyword: Ref<string>;
  page: Ref<number>;
  pageSize: Ref<number>;
  priority: Ref<TicketPriority | undefined>;
  status: Ref<TicketStatus | undefined>;
  ticketType: Ref<TicketType | undefined>;
  deptId: Ref<number | undefined>;
  slaStatus: Ref<TicketSlaStatus | undefined>;
}

function readString(value: unknown) {
  if (typeof value === 'string' && value) {
    return value;
  }

  return undefined;
}

function readPositiveNumber(value: unknown) {
  const result = Number(readString(value));

  return Number.isInteger(result) && result > 0 ? result : undefined;
}

export function useTicketFilterQuery(filters: TicketFilterRefs) {
  const route = useRoute();
  const router = useRouter();

  filters.keyword.value = readString(route.query.keyword) ?? '';
  filters.page.value = readPositiveNumber(route.query.page) ?? 1;
  filters.pageSize.value = readPositiveNumber(route.query.pageSize) ?? 20;
  filters.assigneeId.value = readPositiveNumber(route.query.PICid);
  filters.deptId.value = readPositiveNumber(route.query.deptId);
  filters.slaStatus.value = readString(route.query.slaStatus) as
    | TicketSlaStatus
    | undefined;

  filters.priority.value = readString(route.query.priority) as
    | TicketPriority
    | undefined;
  filters.status.value = readString(route.query.status) as
    | TicketStatus
    | undefined;
  filters.ticketType.value = readString(route.query.type) as
    | TicketType
    | undefined;

  const startTime = readString(route.query.startTime);
  const endTime = readString(route.query.endTime);

  filters.createTimeRange.value =
    startTime && endTime ? [startTime, endTime] : undefined;

  function syncFilterQuery() {
    void router.replace({
      query: {
        deptId: filters.deptId.value,
        PICid: filters.assigneeId.value,
        endTime: filters.createTimeRange.value?.[1],
        keyword: filters.keyword.value.trim() || undefined,
        page: filters.page.value,
        pageSize: filters.pageSize.value,
        priority: filters.priority.value,
        startTime: filters.createTimeRange.value?.[0],
        status: filters.status.value,
        type: filters.ticketType.value,
        slaStatus: filters.slaStatus.value,
      },
    });
  }

  return {
    syncFilterQuery,
  };
}
