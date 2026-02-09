import "./DialogBox.scss";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";

type DialogProps = {
  isOpen: boolean;
  onClose: () => void;
  Heading: ReactNode;
  Description: ReactNode;
  SecondaryButton: ReactNode;
  PrimaryButton: ReactNode;
  onPrimary: () => void;
  onSecondary?: () => void;
};

const Dialog = ({ 
  isOpen, 
  onClose, 
  Heading, 
  Description, 
  SecondaryButton, 
  PrimaryButton,
  onPrimary,
  onSecondary
}: DialogProps) => {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="dialog-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
    >
      <div className="dialog-box">
        <button className="dialog-close" onClick={onClose} aria-label="Close dialog">
          <svg height="20px" viewBox="0 0 384 512" aria-hidden="true" focusable="false">
            <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" />
          </svg>
        </button>

        <div className="dialog-content">
          <p id="dialog-title" className="dialog-title">{Heading}</p>
          <p id="dialog-description" className="dialog-description">{Description}</p>
        </div>

        <div className="dialog-actions">
          <button 
            className="dialog-button dialog-button--secondary"
            onClick={onSecondary || onClose}
          >
            {SecondaryButton}
          </button>
          <button 
            className="dialog-button dialog-button--primary"
            onClick={onPrimary}
          >
            {PrimaryButton}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Dialog;
