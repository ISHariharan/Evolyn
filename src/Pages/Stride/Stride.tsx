import { useEffect } from "react";
import EmptyStrideState from "../../Components/EmptyStride/EmptyStrideState";
import { showLoader, hideLoader } from "../../Common/ApplicationLoader/loaderController";

const Stride = () => {
    useEffect(() => {
        setTimeout(() => {
            showLoader();
        }, 1000);

        hideLoader();
    }, []);

    return (
        <div>
            <div className="stride-emptystate-container">
                <EmptyStrideState />
            </div>
        </div>
    )
};

export default Stride;