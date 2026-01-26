import "./CreateStrideWorkspaceDialog.scss";
import { StrideWorkspaceIcons } from "../../Statics/StrideWorkspaceIcons/StrideWorkspaceIcons";
import { useState } from "react";

const CreateStrideWorkspaceDialog = ({ onClose }) => {
  console.log('Stride Workspace Icons : ', StrideWorkspaceIcons);
  const [showIcons, setShowIcons] = useState<Boolean>(false);

  const handleWorkspaceIcon = () => {
    setShowIcons(!showIcons);
  }

  return (
    <div
      className="create-stride-workspace__backdrop"
      onClick={onClose}
    >
      <div
        className="create-stride-workspace__dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="create-stride-workspace__header">
            <div>
                <h2>Create your Stride Workspace</h2>
                <p className="create-stride-workspace__subtitle">
                    A Stride Workspace is your personal execution space to plan, track, and complete your daily tasks using a simple Kanban flow.
                </p>
            </div>
            <button
                className="create-stride-workspace__close"
                onClick={onClose}
            >
                ✕
            </button>
        </div>

        {/* Body */}
        <div className="create-stride-workspace__body">
          <div className="create-stride-workspace__form-group">
            <label>Icon & name</label>
            <div className="IconName-WorkspaceName-Container">
                <div>
                    <button className="Stride-IconName-Button" onClick={() => handleWorkspaceIcon()}>
                        <div className="bx bx-shape-circle nav__icon Stride-IconName" />
                    </button>
                </div>
                <div className="Stride-WorkspaceName-InputBox-Container">
                    <input
                        className="Stride-WorkspaceName-InputBox"
                        type="text"
                        placeholder="e.g. Daily Focus, Study Stride"
                    />
                </div>
            </div>
          </div>

          {showIcons && (
            <div className="Stride-Workspace-Icons-Container">
                {StrideWorkspaceIcons.map((icon, index) => (
                    <div className="Stride-Workspace-Icon-Container" key={index}>
                        <div className={icon} />
                    </div>
                ))}
            </div>
          )}

          <div className="create-stride-workspace__form-group">
            <label>Description (optional)</label>
            <input
              className="Stride-WorkspaceName-Description"
              type="text"
              placeholder="What will you use this workspace for?"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="create-stride-workspace__footer">
          <button
            className="create-stride-workspace__btn create-stride-workspace__btn--secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="create-stride-workspace__btn create-stride-workspace__btn--primary"
          >
            Create Workspace
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateStrideWorkspaceDialog;