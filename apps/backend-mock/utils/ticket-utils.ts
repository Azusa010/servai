import type { TicketAction, TicketStatus } from '~/utils/mock-data';

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
