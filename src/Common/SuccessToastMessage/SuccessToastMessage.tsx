import "./SuccessToastMessage.scss";

const SuccessToastMessage = () => {
  return (
    <div className="toastmessage-success-card">
      {/* <svg className="toastmessage-success-wave" viewBox="0 0 1440 320">
        <path d="M0,256L11.4,240C22.9,224,46,192,69,192C91.4,192,114,224,137,234.7C160,245,183,235,206,213.3C228.6,192,251,160,274,149.3C297.1,139,320,149,343,181.3C365.7,213,389,267,411,282.7C434.3,299,457,277,480,250.7C502.9,224,526,192,549,181.3C571.4,171,594,181,617,208C640,235,663,277,686,256C708.6,235,731,149,754,122.7C777.1,96,800,128,823,165.3C845.7,203,869,245,891,224C914.3,203,937,117,960,112C982.9,107,1006,181,1029,197.3C1051.4,213,1074,171,1097,144C1120,117,1143,107,1166,133.3C1188.6,160,1211,224,1234,218.7C1257.1,213,1280,139,1303,133.3C1325.7,128,1349,192,1371,192C1394.3,192,1417,128,1429,96L1440,64L1440,320Z" />
      </svg> */}

      <div className="toastmessage-success-icon-container">
        <svg className="toastmessage-success-icon" viewBox="0 0 512 512">
          <path d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209l-111 111-64-64" />
        </svg>
      </div>

      <div className="toastmessage-success-text-container">
        <p className="toastmessage-success-title">Success message</p>
        <p className="toastmessage-success-subtitle">Everything seems great</p>
      </div>

      <svg className="toastmessage-success-close" viewBox="0 0 15 15">
        <path d="M11.78 4.03 7.5 8.31 3.22 4.03" />
      </svg>
    </div>
  );
};

export default SuccessToastMessage;
