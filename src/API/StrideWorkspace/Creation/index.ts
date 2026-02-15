import { CreateWorkspace } from "../../../Components/CreateStrideWorkspaceDialog/types";
import { workspaceCreation } from "./api";

export const createStrideWorkspace = (WorkspaceDetails : CreateWorkspace, userId : any) => {
    return workspaceCreation(WorkspaceDetails, userId);
}