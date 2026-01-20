import "./WarningToastMessage.scss";

const WarningToastMessage = () => {
  return (
    <div className="toastmessage-warning-card">
      <div className="toastmessage-warning-icon-container">
        <svg className="toastmessage-warning-icon" viewBox="0 0 256 256">
          <path d="M128 24 16 216h224z" />
        </svg>
      </div>

      <div className="toastmessage-warning-text-container">
        <p className="toastmessage-warning-title">Warning message</p>
        <p className="toastmessage-warning-subtitle">We think you should check it</p>
      </div>

      <svg className="toastmessage-warning-close" viewBox="0 0 15 15">
        <path d="M11.78 4.03 7.5 8.31 3.22 4.03" />
      </svg>
    </div>
  );
};

export default WarningToastMessage;
