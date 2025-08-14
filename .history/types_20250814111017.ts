


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

export enum LogActionType {
  CREATE_ITEM = 'CREATE_ITEM',
  UPDATE_ITEM_STATUS = 'UPDATE_ITEM_STATUS',
  CREATE_USER = 'CREATE_USER',
}

export interface ActivityLog {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: LogActionType;
  details: {
    itemId?: string;
    itemTitle?: string;
    itemType?: ItemType;
    newStatus?: ItemStatus;
    oldStatus?: ItemStatus;
    assigneeName?: string;
    newUserName?: string;
    newUserRole?: Role;
  };
}


export interface User {
  id: string; // Firebase UID
  name: string;
  role: Role;
  email: string;
  fcmTokens?: string[];
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
  creatorId: string;
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