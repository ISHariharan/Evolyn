import { generateUUID } from "../../Common/UUIDGenerator/UUIDGenerator";
import { getWorkspaceId, getWorkspaceName, WorkspaceLike } from "../../Utils/workspaceUtils";
import { CreateTaskInput, Status, Stride, Task } from "./types";

const STRIDE_STORAGE_KEY = "evolyn_stride_boards_v1";
const TASK_STORAGE_KEY = "evolyn_stride_tasks_v1";

export const DEFAULT_STRIDE_STATUSES: Status[] = [
  {
    id: "todo",
    name: "Todo",
    order: 1,
    color: "#6366f1",
    icon: "bx bx-inbox",
  },
  {
    id: "in-progress",
    name: "In Progress",
    order: 2,
    color: "#0ea5e9",
    icon: "bx bx-loader-circle",
  },
  {
    id: "wont-do",
    name: "Won't Do",
    order: 3,
    color: "#ef4444",
    icon: "bx bx-minus-circle",
  },
  {
    id: "done",
    name: "Done",
    order: 4,
    color: "#10b981",
    icon: "bx bx-check-circle",
  },
];

const readStorage = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeStorage = <T,>(key: string, value: T) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const normalizeStride = (stride: Stride): Stride => ({
  ...stride,
  statuses: [...DEFAULT_STRIDE_STATUSES],
});

export const getStoredStrides = (): Stride[] => {
  const strides = readStorage<Stride[]>(STRIDE_STORAGE_KEY, []);
  return strides.map(normalizeStride);
};

const saveStoredStrides = (strides: Stride[]) => {
  writeStorage(STRIDE_STORAGE_KEY, strides.map(normalizeStride));
};

export const createDefaultStride = (workspace: WorkspaceLike): Stride | null => {
  const workspaceId = getWorkspaceId(workspace);
  if (!workspaceId) {
    return null;
  }

  return {
    id: generateUUID(),
    workspaceId,
    name: `${getWorkspaceName(workspace)} Board`,
    statuses: [...DEFAULT_STRIDE_STATUSES],
  };
};

export const ensureDefaultStrideForWorkspace = (workspace: WorkspaceLike): Stride | null => {
  const workspaceId = getWorkspaceId(workspace);
  if (!workspaceId) {
    return null;
  }

  const storedStrides = getStoredStrides();
  const existingStride = storedStrides.find((stride) => stride.workspaceId === workspaceId);

  if (existingStride) {
    const normalizedStride = normalizeStride(existingStride);
    saveStoredStrides(
      storedStrides.map((stride) =>
        stride.workspaceId === workspaceId ? normalizedStride : stride
      )
    );
    return normalizedStride;
  }

  const defaultStride = createDefaultStride(workspace);
  if (!defaultStride) {
    return null;
  }

  saveStoredStrides([...storedStrides, defaultStride]);
  return defaultStride;
};

export const ensureDefaultStridesForWorkspaces = (workspaces: WorkspaceLike[]): Stride[] => {
  return workspaces
    .map((workspace) => ensureDefaultStrideForWorkspace(workspace))
    .filter(Boolean) as Stride[];
};

export const getStrideForWorkspace = (workspaceId: string): Stride | null => {
  return getStoredStrides().find((stride) => stride.workspaceId === workspaceId) || null;
};

export const getTasksForStride = (strideId: string): Task[] => {
  return readStorage<Task[]>(TASK_STORAGE_KEY, []).filter((task) => task.strideId === strideId);
};

const getStoredTasks = (): Task[] => {
  return readStorage<Task[]>(TASK_STORAGE_KEY, []);
};

const saveStoredTasks = (tasks: Task[]) => {
  writeStorage(TASK_STORAGE_KEY, tasks);
};

export const createTaskForStride = (
  stride: Stride,
  workspaceId: string,
  taskInput: CreateTaskInput
): Task => {
  const task: Task = {
    id: generateUUID(),
    strideId: stride.id,
    workspaceId,
    title: taskInput.title,
    description: taskInput.description,
    statusId: taskInput.statusId,
    priority: taskInput.priority || "Medium",
    labels: taskInput.labels || [],
    dueDate: taskInput.dueDate,
    createdAt: new Date().toISOString(),
  };

  saveStoredTasks([...getStoredTasks(), task]);
  return task;
};
