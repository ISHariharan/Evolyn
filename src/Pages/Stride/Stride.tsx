import { useEffect } from "react";
import EmptyStrideState from "../../Components/EmptyStride/EmptyStrideState";
import { showLoader, hideLoader } from "../../Common/ApplicationLoader/loaderController";

const Stride = () => {

    return (
        <div>
            <div className="stride-emptystate-container">
                <EmptyStrideState />
            </div>
        </div>
    )
};

export default Stride;