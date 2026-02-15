import "./CreateStrideWorkspaceDialog.scss";
import { StrideWorkspaceIcons } from "../../Statics/StrideWorkspaceIcons/StrideWorkspaceIcons";
import { useState } from "react";
import { CreateWorkspace } from "./types";
import { generateUUID } from "../../Common/UUIDGenerator/UUIDGenerator";
import ErrorToastMessage from "../../Common/ErrorToastMessage/ErrorToastMessage";
import { useStore } from "../../Store/GlobalStore/GlobalStore";
import { createStrideWorkspace } from "../../API/StrideWorkspace/Creation";
import { hideLoader, showLoader } from "../../Common/ApplicationLoader/loaderController";
import SuccessToastMessage from "../../Common/SuccessToastMessage/SuccessToastMessage";

const CreateStrideWorkspaceDialog = ({ onClose }) => {
  const {state} = useStore();
  const [showIcons, setShowIcons] = useState<Boolean>(false);
  const [showSuccessToastMessage, setShowSuccessToastMessage] = useState<Boolean>(false);
  const [successToastMessageBody, setSuccessToastMessageBody] = useState("");
  const [selectedIcon, setSelectedIcon] = useState('bx bx-shape-circle nav__icon');
  const [workspaceName, setWorkspaceName] = useState("");
  const [description, setDescription] = useState("");
  const [showErrorToastMessage, setShowErrorToastMessage] = useState(false);

  const handleWorkspaceIcon = () => {
    setShowIcons(!showIcons);
  }

  const handleIconSelection = (icon) => {
    setSelectedIcon(icon);
    setShowIcons(!showIcons);
  }

  const handleCreateWorkspace = async () => {
    showLoader();
    const UUID = generateUUID();
    const props : CreateWorkspace = {
      workspaceId: UUID,
      workspaceName,
      workspaceDescription : description,
      workspaceIcon : selectedIcon
    }
    console.log('Handle Create Workspace : ', props);
    try {
      const response = await createStrideWorkspace(props, state.userDetails.id);
      console.log('Workspace Response : ', response);
      if(response.status){
        setShowSuccessToastMessage(true);
        setSuccessToastMessageBody(`${workspaceName} Created`);
        setTimeout(() => {
          onClose();
        }, 3000);
      } else{
        setShowErrorToastMessage(true);
      }
    } catch {
      setShowErrorToastMessage(true);
    }

    hideLoader();
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

        <div className="create-stride-workspace__body">
          <div className="create-stride-workspace__form-group">
            <label>Icon & name</label>
            <div className="IconName-WorkspaceName-Container">
                <div>
                    <button className="Stride-IconName-Button" onClick={() => handleWorkspaceIcon()}>
                        <div className={`${selectedIcon} Stride-IconName`} />
                    </button>
                </div>
                <div className="Stride-WorkspaceName-InputBox-Container">
                    <input
                        className="Stride-WorkspaceName-InputBox"
                        type="text"
                        placeholder="e.g. Daily Focus, Study Stride"
                        onChange={(event) => setWorkspaceName(event.target.value)}
                    />
                </div>
            </div>
          </div>

          {showIcons && (
            <div className="Stride-Workspace-Icons-Container">
                {StrideWorkspaceIcons.map((icon, index) => (
                    <div className="Stride-Workspace-Icon-Container" onClick={() => handleIconSelection(icon)} key={index}>
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
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
        </div>

        <div className="create-stride-workspace__footer">
          <button
            className="create-stride-workspace__btn create-stride-workspace__btn--secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="create-stride-workspace__btn create-stride-workspace__btn--primary"
            onClick={handleCreateWorkspace}
          >
            Create Workspace
          </button>
        </div>
      </div>
      {showSuccessToastMessage && (
        <SuccessToastMessage ToastMessageHeader="Workspace Creation Successful" ToastMessageBody={successToastMessageBody} />
      )}
      {showErrorToastMessage && (
        <ErrorToastMessage ToastMessageHeader="Workspace Creation Failed" ToastMessageBody="Workspace Not Created" />
      )}
    </div>
  );
};

export default CreateStrideWorkspaceDialog;