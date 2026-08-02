import type { TicketAction, TicketInfo, TicketStatus } from '~/utils/mock-data';

type TicketTransitionAction = Exclude<TicketAction, 'create'>;

const ticketStatusTransitions: Partial<
  Record<TicketStatus, Partial<Record<TicketTransitionAction, TicketStatus>>>
> = {
  Pending_Confirmation: {
    close: 'Closed',
    confirm: 'Closed',
    transfer: 'Pending_Confirmation',
  },
  Processing: {
    resolve: 'Pending_Confirmation',
    suspend: 'Suspended',
    transfer: 'Processing',
  },
  Suspended: {
    resume: 'Processing',
    transfer: 'Suspended',
  },
  Unassigned: {
    cancel: 'Canceled',
    claim: 'Processing',
  },
};

export function getNextTicketStatus(
  currentStatus: TicketStatus,
  action: TicketTransitionAction,
): TicketStatus | undefined {
  return ticketStatusTransitions[currentStatus]?.[action];
}

export type TicketSlaStatus =
  | 'completed'
  | 'normal'
  | 'overdue'
  | 'paused'
  | 'warning';

const SLA_WARNING_DURATION = 4 * 60 * 60 * 1000;

export function getTicketSlaStatus(
  ticket: Pick<TicketInfo, 'slaDeadline' | 'status'>,
  now = Date.now(),
): TicketSlaStatus {
  if (ticket.status === 'Closed' || ticket.status === 'Canceled') {
    return 'completed';
  }

  if (ticket.status === 'Suspended') {
    return 'paused';
  }

  const deadline = new Date(ticket.slaDeadline).getTime();

  if (Number.isNaN(deadline)) {
    return 'normal';
  }

  const remaingTime = deadline - now;

  if (remaingTime <= 0) {
    return 'overdue';
  }

  if (remaingTime <= SLA_WARNING_DURATION) {
    return 'warning';
  }

  return 'normal';
}
