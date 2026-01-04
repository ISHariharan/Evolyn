import "./IntroCards.scss";
import { IntroCardProps } from "./type";

const IntroCards = ({
  IntroCardIcon,
  IntroCardHeader,
  IntroCardSubHeader,
  IntroIconBackgroundColor,
  IntroCardIconColor,
  className,
  bgColor,
  textColor,
  iconColor,
}: IntroCardProps) => {
  return (
    <div
      className={`intro-card ${className || ""}`.trim()}
      style={{
        ["--intro-bg" as any]: bgColor,
        ["--intro-text" as any]: textColor,
        ["--intro-icon" as any]: iconColor,
      }}
    >
      <div className="introCard-icon-container" style={{backgroundColor: IntroIconBackgroundColor}}>
        <i className={`intro-card__icon ${IntroCardIcon}`} style={{color: IntroCardIconColor}} aria-hidden="true" />
      </div>
      <div className="intro-card__text">
        <h3 className="intro-card__title">{IntroCardHeader}</h3>
        <span className="intro-card__sub">{IntroCardSubHeader}</span>
      </div>
    </div>
  );
};

export default IntroCards;
