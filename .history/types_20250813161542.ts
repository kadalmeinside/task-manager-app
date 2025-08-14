
export enum Role {
  SUPER_ADMIN = 'Super Admin',
  DIRECTOR = 'Director',
  STAFF = 'Staff',
}

export enum ItemType {
  TASK = 'Task',
  PROJECT = 'Project',
}

export enum ItemStatus {
  TODO = 'To Do',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
}


export interface User {
  id: string; // Firebase UID
  name: string;
  role: Role;
  email: string;
}

interface BaseItem {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  dueDate: Date;
  status: ItemStatus;
  type: ItemType;
  color: string;
}

export interface Task extends BaseItem {
  type: ItemType.TASK;
  assigneeId: string; // Firebase UID
  projectId?: string;
  completionUrl?: string;
  note?: string;
  completedOn?: Date;
  overdueDays?: number;
}

export interface Project extends BaseItem {
  type: ItemType.PROJECT;
  assigneeId: string; // Firebase UID
  tasks: string[];
}

export type AppItem = Task | Project;