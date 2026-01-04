
import FeatureCard from "../FeatureCard/FeatureCard";
import EyeBrowSection from "../../Common/EyeBrowSection/EyeBrowSection";
import IntroCards from "../../Common/IntroCards/IntroCards";
import "./Explore.scss";


const Explore = () => {
    const introCardData = [
        {
            IntroCardIcon: "bx bx-grid-alt evolyn-card-icon",
            IntroCardHeader: "Don’t just track your life.",
            IntroCardSubHeader: "Build systems that convert daily actions into long-term outcomes.",
            IntroIconBackgroundColor: "#1e3a8a",
            IntroCardIconColor: "#ffffff",
        },
        {
            IntroCardIcon: "bx bx-brain evolyn-card-icon",
            IntroCardHeader: "Your growth, reimagined.",
            IntroCardSubHeader: "Everything looks simple on the surface — but works intelligently underneath.",
            IntroIconBackgroundColor: "#065f46",
            IntroCardIconColor: "#ecfeff",
        },
        {
            IntroCardIcon: "bx bx-line-chart evolyn-card-icon",
            IntroCardHeader: "Progress that speaks for itself.",
            IntroCardSubHeader: "Evolyn turns behavior into insights — and insights into proof.",
            IntroIconBackgroundColor: "#7c2d12",
            IntroCardIconColor: "#fde68a",
        },
    ];  
    return (
        <div>
            <div className="EyeBrow-Container">
                <EyeBrowSection content="The Next Evolution of Personal Growth" backgroundColor="#dbeafe" Color="#1d4ed8"/>
            </div>
            <div className="explore-main-heading">
                <div className="explore-main-heading-h1">
                    <h1>
                        Meet Your
                        <br/>
                        <span className="explore-heading-gradient">EVOLYN SYSTEM</span>
                    </h1>
                </div>
            </div>
            <div className="explore-subheading">
                <div>Your personal operating system for discipline, growth, and verifiable progress.
Designed to work quietly — and compound over time.</div>
            </div>
            <div className="explore-chat-card">
                <div className="explore-chatIcon bx bxs-chat"></div>
                <div>
                    <span>"Hi. I’m Evolyn — a system that tracks your actions, learns your patterns, and helps you build long-term consistency. Ask me anything about your progress.!"</span>
                </div>
            </div>
            <div>
                <button className="explore-getStarted-button">
                    <div className="explore-getStarted-rightIcon bx bxs-crown"></div>
                    <p>Get Started</p>
                    <div className="explore-getStarted-rightIcon bx bx-right-arrow-alt"></div>
                </button>
            </div>
            <div className="explore-card-container">
                {introCardData.map((item, index) => (
                    <IntroCards {...item} key={index}/>
                ))}
            </div>
        </div>
    );
}

export default Explore;
