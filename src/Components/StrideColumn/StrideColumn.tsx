import type { CSSProperties } from "react";
import { Status, Task } from "../../API/Stride/types";
import StrideCard from "../StrideCard/StrideCard";
import "./StrideColumn.scss";

interface StrideColumnProps {
  status: Status;
  tasks: Task[];
  onAddTask: (statusId: string) => void;
}

const StrideColumn = ({ status, tasks, onAddTask }: StrideColumnProps) => {
  return (
    <section className="stride-column" style={{ "--stride-column-color": status.color } as CSSProperties}>
      <div className="stride-column__header">
        <div className="stride-column__title">
          <span className="stride-column__icon">
            <i className={status.icon} />
          </span>
          <h2>{status.name}</h2>
          <span className="stride-column__count">{tasks.length}</span>
        </div>
        <button
          className="stride-column__add"
          type="button"
          aria-label={`Add task to ${status.name}`}
          onClick={() => onAddTask(status.id)}
        >
          <i className="bx bx-plus" />
        </button>
      </div>

      <div className="stride-column__tasks">
        {tasks.length > 0 ? (
          tasks.map((task) => <StrideCard task={task} status={status} key={task.id} />)
        ) : (
          <div className="stride-column__empty">
            <i className="bx bx-dots-horizontal-rounded" />
            <span>No items</span>
          </div>
        )}
      </div>
    </section>
  );
};

export default StrideColumn;
