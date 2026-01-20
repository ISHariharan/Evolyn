import "./InfoToastMessage.scss";

const InfoToastMessage = () => {
  return (
    <div className="toastmessage-info-card">
      <div className="toastmessage-info-icon-container">
        <svg className="toastmessage-info-icon" viewBox="0 0 24 24">
          <path d="M12 2a10 10 0 1 1 0 20m0-14v6" />
        </svg>
      </div>

      <div className="toastmessage-info-text-container">
        <p className="toastmessage-info-title">Info message</p>
        <p className="toastmessage-info-subtitle">You just should know this</p>
      </div>

      <svg className="toastmessage-info-close" viewBox="0 0 15 15">
        <path d="M11.78 4.03 7.5 8.31 3.22 4.03" />
      </svg>
    </div>
  );
};

export default InfoToastMessage;
