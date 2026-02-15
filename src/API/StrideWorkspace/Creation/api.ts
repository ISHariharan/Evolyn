import { CreateWorkspace } from "../../../Components/CreateStrideWorkspaceDialog/types"

const evolynApi = 'evolyn/api';


export const workspaceCreation = async (workspaceDetails : CreateWorkspace, userId : any) => {
    const payload = {
        workspaceDetails,
        userId : userId,
    }
    const url = `${evolynApi}/store/workspace/creation`;
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });
    let data = null;
    try {
        data = await response.json();
    } catch (err) {
        data = err;
    }
    return {
        status: response.ok,
        statusText: response.statusText,
        data,
    };
}