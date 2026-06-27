export interface Status {
  id: string;
  name: string;
  order: number;
  color: string;
  icon: string;
}

export interface Stride {
  id: string;
  workspaceId: string;
  name: string;
  statuses: Status[];
}

export type TaskPriority = "Low" | "Medium" | "High";

export interface Task {
  id: string;
  strideId: string;
  workspaceId: string;
  title: string;
  description?: string;
  statusId: string;
  priority?: TaskPriority;
  labels?: string[];
  dueDate?: string;
  createdAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  statusId: string;
  priority?: TaskPriority;
  labels?: string[];
  dueDate?: string;
}
