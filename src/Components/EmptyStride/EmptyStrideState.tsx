import "./EmptyStrideState.scss";
import EmptyStateImage from "../../Statics/StrideEmptyState.svg";

const EmptyStrideState = () => {
    return (
        <div className="EmptyStride-Container">
            <div className="EmptyStrideState-Image-Container">
                <img src={EmptyStateImage} alt="Stride Empty State Image" width="50%" height="50%"/>
            </div>
            <div className="relative group">
                <button
                    className="
                    relative inline-block p-px font-semibold leading-6
                    shadow-2xl cursor-pointer rounded-xl shadow-zinc-900
                    transition-transform duration-300 ease-in-out
                    hover:scale-105 active:scale-95
                    "
                    style={{
                    background: "var(--button-color)",
                    color: "var(--button-text-color)",
                    }}
                >
                    {/* Glow / Gradient Border */}
                    <span
                    className="
                        absolute inset-0 rounded-xl p-[2px]
                        opacity-0 transition-opacity duration-500
                        group-hover:opacity-100
                    "
                    style={{
                        background: "linear-gradient(90deg, var(--first-color), var(--card-color), var(--gold-2))",
                    }}
                    />

                    {/* Inner Button */}
                    <span
                    className="relative z-10 block px-6 py-3 rounded-xl"
                    style={{
                        background: "var(--button-color)",
                        color: "var(--button-text-color)",
                    }}
                    >
                    <div className="relative z-10 flex items-center space-x-2">
                        <span className="transition-all duration-500 group-hover:translate-x-1">
                            Start you Stride WorkSpace
                        </span>

                        <svg
                        className="w-6 h-6 transition-transform duration-500 group-hover:translate-x-1"
                        aria-hidden="true"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                        >
                        <path
                            clipRule="evenodd"
                            d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
                            fillRule="evenodd"
                        />
                        </svg>
                    </div>
                    </span>
                </button>
            </div>
        </div>
    );
}

export default EmptyStrideState;