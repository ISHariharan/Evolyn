import "./EyeBrowSection.scss";

const EyeBrowSection = (props) => {
    return (
        <div>
            <div className="info">
                <div className="info__icon bx bx-crown"></div>
                <div className="info__title">{props.content}</div>
            </div>
        </div>
    );
}

export default EyeBrowSection;