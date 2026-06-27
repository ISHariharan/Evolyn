import { FormEvent, useMemo, useState } from "react";
import { CreateTaskInput, Status, TaskPriority } from "../../API/Stride/types";
import "./CreateTaskModal.scss";

interface CreateTaskModalProps {
  statuses: Status[];
  initialStatusId: string;
  onClose: () => void;
  onCreateTask: (task: CreateTaskInput) => void;
}

const priorities: TaskPriority[] = ["Low", "Medium", "High"];

const CreateTaskModal = ({
  statuses,
  initialStatusId,
  onClose,
  onCreateTask,
}: CreateTaskModalProps) => {
  const defaultStatusId = useMemo(
    () => statuses.find((status) => status.id === initialStatusId)?.id || statuses[0]?.id || "",
    [initialStatusId, statuses]
  );
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [statusId, setStatusId] = useState(defaultStatusId);
  const [priority, setPriority] = useState<TaskPriority>("Medium");
  const [labels, setLabels] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      return;
    }

    onCreateTask({
      title: trimmedTitle,
      description: description.trim(),
      statusId,
      priority,
      labels: labels
        .split(",")
        .map((label) => label.trim())
        .filter(Boolean),
      dueDate,
    });
  };

  return (
    <div className="create-task-modal__backdrop" onClick={onClose}>
      <form className="create-task-modal" onSubmit={handleSubmit} onClick={(event) => event.stopPropagation()}>
        <div className="create-task-modal__header">
          <div>
            <h2>New Task</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close task modal">
            <i className="bx bx-x" />
          </button>
        </div>

        <label className="create-task-modal__field">
          <span>Title</span>
          <input
            autoFocus
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Task name"
          />
        </label>

        <label className="create-task-modal__field">
          <span>Description</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Notes or context"
            rows={3}
          />
        </label>

        <div className="create-task-modal__grid">
          <label className="create-task-modal__field">
            <span>Status</span>
            <select value={statusId} onChange={(event) => setStatusId(event.target.value)}>
              {statuses.map((status) => (
                <option value={status.id} key={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
          </label>

          <label className="create-task-modal__field">
            <span>Priority</span>
            <select value={priority} onChange={(event) => setPriority(event.target.value as TaskPriority)}>
              {priorities.map((priorityOption) => (
                <option value={priorityOption} key={priorityOption}>
                  {priorityOption}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="create-task-modal__grid">
          <label className="create-task-modal__field">
            <span>Labels</span>
            <input
              value={labels}
              onChange={(event) => setLabels(event.target.value)}
              placeholder="Work, Health"
            />
          </label>

          <label className="create-task-modal__field">
            <span>Due date</span>
            <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
          </label>
        </div>

        <div className="create-task-modal__footer">
          <button type="button" className="create-task-modal__secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="create-task-modal__primary" disabled={!title.trim()}>
            Create Task
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTaskModal;
