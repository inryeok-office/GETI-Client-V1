export type ScheduledTaskStatus = 'FAILED' | 'SUCCESS';

export type ScheduledTaskActionStatus = 'AVAILABLE' | 'REQUESTED' | 'UNAVAILABLE';

export interface ScheduledTask {
  actionStatus: ScheduledTaskActionStatus;
  description: string;
  lastRunAt: string;
  name: string;
  nextRunAt: string;
  schedule: string;
  status: ScheduledTaskStatus;
  taskId: string;
}
