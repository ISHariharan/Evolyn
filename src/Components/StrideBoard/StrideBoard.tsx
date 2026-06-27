import { useEffect, useMemo, useState } from "react";
import {
  createTaskForStride,
  ensureDefaultStrideForWorkspace,
  getTasksForStride,
} from "../../API/Stride/localStrideStore";
import { CreateTaskInput, Stride, Task } from "../../API/Stride/types";
import { getWorkspaceId, WorkspaceLike } from "../../Utils/workspaceUtils";
import CreateTaskModal from "../CreateTaskModal/CreateTaskModal";
import StrideColumn from "../StrideColumn/StrideColumn";
import StrideHeader from "../StrideHeader/StrideHeader";
import "./StrideBoard.scss";

interface StrideBoardProps {
  workspace: WorkspaceLike;
}

const StrideBoard = ({ workspace }: StrideBoardProps) => {
  const [stride, setStride] = useState<Stride | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [selectedStatusId, setSelectedStatusId] = useState("todo");
  const workspaceId = getWorkspaceId(workspace);

  useEffect(() => {
    const defaultStride = ensureDefaultStrideForWorkspace(workspace);
    setStride(defaultStride);
    setTasks(defaultStride ? getTasksForStride(defaultStride.id) : []);
  }, [workspace]);

  const sortedStatuses = useMemo(() => {
    return [...(stride?.statuses || [])].sort((a, b) => a.order - b.order);
  }, [stride]);

  const tasksByStatus = useMemo(() => {
    return sortedStatuses.reduce<Record<string, Task[]>>((acc, status) => {
      acc[status.id] = tasks.filter((task) => task.statusId === status.id);
      return acc;
    }, {});
  }, [sortedStatuses, tasks]);

  const handleOpenTaskModal = (statusId = sortedStatuses[0]?.id || "todo") => {
    setSelectedStatusId(statusId);
    setIsCreateTaskOpen(true);
  };

  const handleCreateTask = (taskInput: CreateTaskInput) => {
    if (!stride || !workspaceId) {
      return;
    }

    const createdTask = createTaskForStride(stride, workspaceId, taskInput);
    setTasks((currentTasks) => [...currentTasks, createdTask]);
    setIsCreateTaskOpen(false);
  };

  if (!stride) {
    return (
      <div className="stride-board stride-board--empty">
        <p>Workspace board unavailable.</p>
      </div>
    );
  }

  return (
    <main className="stride-board">
      <StrideHeader
        workspace={workspace}
        stride={stride}
        tasks={tasks}
        onAddTask={() => handleOpenTaskModal()}
      />

      <div className="stride-board__columns">
        {sortedStatuses.map((status) => (
          <StrideColumn
            status={status}
            tasks={tasksByStatus[status.id] || []}
            key={status.id}
            onAddTask={handleOpenTaskModal}
          />
        ))}
      </div>

      {isCreateTaskOpen && (
        <CreateTaskModal
          statuses={sortedStatuses}
          initialStatusId={selectedStatusId}
          onClose={() => setIsCreateTaskOpen(false)}
          onCreateTask={handleCreateTask}
        />
      )}
    </main>
  );
};

export default StrideBoard;
