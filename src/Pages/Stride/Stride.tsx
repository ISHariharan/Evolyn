import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EmptyStrideState from "../../Components/EmptyStride/EmptyStrideState";
import { useStore } from "../../Store/GlobalStore/GlobalStore";
import { getWorkspaceArray, getWorkspaceId } from "../../Utils/workspaceUtils";

const Stride = () => {
    const { state } = useStore();
    const navigate = useNavigate();

    useEffect(() => {
        const workspaces = getWorkspaceArray(state.workspace);
        const firstWorkspaceId = getWorkspaceId(workspaces[0]);
        if (firstWorkspaceId) {
            navigate(`/workspace/${firstWorkspaceId}/stride`, { replace: true });
        }
    }, [navigate, state.workspace]);

    return (
        <div>
            <div className="stride-emptystate-container">
                <EmptyStrideState />
            </div>
        </div>
    )
};

export default Stride;