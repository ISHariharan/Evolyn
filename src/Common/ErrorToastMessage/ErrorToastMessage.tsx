import "./ErrorToastMessage.scss";

const ErrorToastMessage = () => {
  return (
    <div className="toastmessage-error-card">
      <svg className="toastmessage-error-wave" viewBox="0 0 1440 320">
        <path d="M0,256L1440,320L1440,0L0,0Z" />
      </svg>

      <div className="toastmessage-error-icon-container">
        <svg className="toastmessage-error-icon" viewBox="0 0 512 512">
          <path d="M256 48a208 208 0 1 1 0 416M175 175l162 162M337 175 175 337" />
        </svg>
      </div>

      <div className="toastmessage-error-text-container">
        <p className="toastmessage-error-title">Error message</p>
        <p className="toastmessage-error-subtitle">Something went wrong</p>
      </div>

      <svg className="toastmessage-error-close" viewBox="0 0 15 15">
        <path d="M11.78 4.03 7.5 8.31 3.22 4.03" />
      </svg>
    </div>
  );
};

export default ErrorToastMessage;
