
import FeatureCard from "../FeatureCard/FeatureCard";
import EyeBrowSection from "../../Common/EyeBrowSection/EyeBrowSection";
import "./Explore.scss";


const Explore = () => {
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
        </div>
    );
}

export default Explore;
