import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getAllWorkspaces } from "../../API/StrideWorkspace/Retrieve";
import StrideBoard from "../../Components/StrideBoard/StrideBoard";
import { useStore } from "../../Store/GlobalStore/GlobalStore";
import {
  findWorkspaceById,
  getWorkspaceArray,
  getWorkspaceId,
  WorkspaceLike,
} from "../../Utils/workspaceUtils";
import { ensureDefaultStridesForWorkspaces } from "../../API/Stride/localStrideStore";
import "./WorkspaceStrideView.scss";

const WorkspaceStrideView = () => {
  const { workspaceId } = useParams();
  const { state, dispatch } = useStore();
  const [workspace, setWorkspace] = useState<WorkspaceLike | undefined>(
    findWorkspaceById(state.workspace, workspaceId)
  );
  const [isLoading, setIsLoading] = useState(false);
  const [requestedWorkspaceId, setRequestedWorkspaceId] = useState<string | undefined>();

  useEffect(() => {
    const localWorkspace = findWorkspaceById(state.workspace, workspaceId);
    if (localWorkspace) {
      setWorkspace(localWorkspace);
      return;
    }

    if (requestedWorkspaceId === workspaceId) {
      return;
    }

    const loadWorkspaces = async () => {
      const userId = state.userDetails?.id;
      if (!userId || !workspaceId) {
        setWorkspace(undefined);
        return;
      }

      setIsLoading(true);
      setRequestedWorkspaceId(workspaceId);
      try {
        const allWorkspaces = await getAllWorkspaces(userId);
        const workspaceList = getWorkspaceArray(allWorkspaces);
        ensureDefaultStridesForWorkspaces(workspaceList);
        dispatch({ type: "SET_WORKSPACE", payload: allWorkspaces });
        setWorkspace(workspaceList.find((item) => getWorkspaceId(item) === workspaceId));
      } catch (error) {
        console.log("Failed to load workspace stride:", error);
        setWorkspace(undefined);
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkspaces();
  }, [dispatch, requestedWorkspaceId, state.userDetails?.id, state.workspace, workspaceId]);

  if (isLoading) {
    return (
      <div className="workspace-stride-view workspace-stride-view--centered">
        <div className="workspace-stride-view__loader" />
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="workspace-stride-view workspace-stride-view--centered">
        <div className="workspace-stride-view__missing">
          <i className="bx bx-folder-open" />
          <h1>Workspace not found</h1>
          <Link to="/stride">Back to Stride</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="workspace-stride-view">
      <StrideBoard workspace={workspace} />
    </div>
  );
};

export default WorkspaceStrideView;
