import type { CSSProperties } from "react";
import { Status, Task } from "../../API/Stride/types";
import "./StrideCard.scss";

interface StrideCardProps {
  task: Task;
  status: Status;
}

const formatDate = (value?: string) => {
  if (!value) {
    return "";
  }

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

const StrideCard = ({ task, status }: StrideCardProps) => {
  return (
    <article className="stride-card" style={{ "--stride-status-color": status.color } as CSSProperties}>
      <div className="stride-card__topline" />
      <div className="stride-card__header">
        <div>
          <h3>{task.title}</h3>
          {task.description && <p>{task.description}</p>}
        </div>
      </div>

      <div className="stride-card__meta">
        <span className="stride-card__status">
          <i className={status.icon} />
          {status.name}
        </span>
        {task.priority && (
          <span className={`stride-card__priority stride-card__priority--${task.priority.toLowerCase()}`}>
            {task.priority}
          </span>
        )}
      </div>

      {task.labels && task.labels.length > 0 && (
        <div className="stride-card__labels">
          {task.labels.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
      )}

      {task.dueDate && (
        <div className="stride-card__footer">
          <span>
            <i className="bx bx-calendar" />
            {formatDate(task.dueDate)}
          </span>
        </div>
      )}
    </article>
  );
};

export default StrideCard;
