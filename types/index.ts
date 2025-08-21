export type Frequency = 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'BIANNUAL' | 'ANNUAL';

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Area {
  id: string;
  name: string;
  color: string;
  userId: string;
  createdAt: Date;
}

export interface Task {
  id: string;
  name: string;
  description?: string;
  frequency: Frequency;
  areaId?: string;
  area?: Area;
  userId: string;
  startDate: Date;
  weekOfMonth?: number; // 1-4
  monthsArray?: string; // JSON array
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  completions: Completion[];
}

export interface Completion {
  id: string;
  taskId: string;
  completedAt: Date;
  period: string;
}

export interface DashboardData {
  weekly: TaskWithCompletion[];
  monthly: TaskWithCompletion[];
  quarterly: TaskWithCompletion[];
  biannual: TaskWithCompletion[];
  annual: TaskWithCompletion[];
}

export interface TaskWithCompletion extends Task {
  isCompleted: boolean;
  dueDate: Date;
  period: string;
}
