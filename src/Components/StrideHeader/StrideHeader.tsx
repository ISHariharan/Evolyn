import { getWorkspaceDescription, getWorkspaceIcon, getWorkspaceName, WorkspaceLike } from "../../Utils/workspaceUtils";
import { Stride, Task } from "../../API/Stride/types";
import "./StrideHeader.scss";

interface StrideHeaderProps {
  workspace: WorkspaceLike;
  stride: Stride;
  tasks: Task[];
  onAddTask: () => void;
}

const StrideHeader = ({ workspace, stride, tasks, onAddTask }: StrideHeaderProps) => {
  const doneStatus = stride.statuses.find((status) => status.id === "done");
  const doneCount = doneStatus
    ? tasks.filter((task) => task.statusId === doneStatus.id).length
    : 0;
  const activeCount = tasks.length - doneCount;
  const completion = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;

  return (
    <header className="stride-header">
      <div className="stride-header__workspace">
        <div className="stride-header__workspace-icon">
          <i className={getWorkspaceIcon(workspace)} />
        </div>
        <div className="stride-header__copy">
          <p className="stride-header__eyebrow">{getWorkspaceName(workspace)}</p>
          <h1>{stride.name}</h1>
          {getWorkspaceDescription(workspace) && (
            <p className="stride-header__description">{getWorkspaceDescription(workspace)}</p>
          )}
        </div>
      </div>

      <div className="stride-header__actions">
        <div className="stride-header__stats" aria-label="Stride board summary">
          <div>
            <span>{tasks.length}</span>
            <small>Tasks</small>
          </div>
          <div>
            <span>{activeCount}</span>
            <small>Active</small>
          </div>
          <div>
            <span>{completion}%</span>
            <small>Done</small>
          </div>
        </div>
        <button className="stride-header__add" type="button" onClick={onAddTask}>
          <i className="bx bx-plus" />
          Add Task
        </button>
      </div>
    </header>
  );
};

export default StrideHeader;
