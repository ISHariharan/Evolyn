
import EyeBrowSection from "../../Common/EyeBrowSection/EyeBrowSection";
import IntroCards from "../../Common/IntroCards/IntroCards";
import FeatureCard from "../FeatureCard/FeatureCard";
import Footer from "../Footer/Footer";
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

    const principles = [
        {
           Heading1: "Intentional.",
           Heading2: "But Smarter.",
           SubHeading: "Evolyn quietly observes your actions, identifies patterns, and helps you stay aligned — even when motivation fades.",
           boxColor: "linear-gradient(135deg, #2563eb, #0ea5e9)",
           reverse: false,
           Points: [
            "Always-on tracking",
            "Zero manual reporting",
            "Data-backed insights",
            "No missed signals",
           ], 
        },
        {
            Heading1: "Authentic.",
            Heading2: "The Real You, Amplified.",
            SubHeading:
                "Your AI Twin doesn’t imitate — it represents you accurately, consistently, and professionally.",
            boxColor: "linear-gradient(135deg, #059669, #10b981)",
            reverse: true,
            Points: [
                "Speaks in your tone",
                "Shares your story",
                "Reflects your personality",
                "Represents you authentically",
            ],
        },
        {
            Heading1: "Simple.",
            Heading2: "Because AI Should Feel Effortless.",
            SubHeading:
                "Set it up once. Evolyn works quietly in the background — handling conversations, questions, and leads for you.",
            boxColor: "linear-gradient(135deg, #7c3aed, #9333ea)",
            reverse: false,
            Points: [
                "Create your page once",
                "Train your Twin easily",
                "Let it work for you",
            ],
        },
    ];

    const FeatureCardData = [
        {
            Title : "Stride",
            Tag: "Daily Execution",
            Description : "A lightweight execution engine that turns intent into action — without friction or noise.",
            key_importance : [
                "Enforces daily discipline",
                "Reduces execution fatigue",
                "Maintains work-in-progress focus",
                "Builds momentum through completion",
            ],
        },
        {
            Title : "Expense Tracker",
            Tag: "Financial Awareness",
            Description : "Understand where your money goes and regain control through clear financial signals.",
            key_importance : [
                "Increases spending awareness",
                "Detects unhealthy patterns early",
                "Encourages intentional decisions",
                "Supports long-term financial discipline",
            ],
        },
        {
            Title : "Learning Flow",
            Tag: "Skill Building",
            Description : "Structured learning journeys that turn effort into measurable, provable skill growth.",
            key_importance : [
                "Converts time into outcomes",
                "Tracks real learning progress",
                "Reinforces long-term consistency",
                "Enables verifiable skill proof",
            ],
        },
        {
            Title : "Health & Nutrition",
            Tag: "Physical Discipline",
            Description : "Track health inputs with clarity — focused on trends, not obsession.",
            key_importance : [
                "Improves daily health awareness",
                "Encourages sustainable habits",
                "Identifies plateaus and drift",
                "Supports long-term wellbeing",
            ],
        },
        {
            Title : "Investment Tracker",
            Tag: "Wealth Discipline",
            Description : "A disciplined view of investments built for consistency, not speculation.",
            key_importance : [
                "Promotes consistent investing",
                "Improves allocation visibility",
                "Builds audit-ready history",
                "Reduces emotional decisions",
            ],
        },
        {
            Title : "Skill Proof",
            Tag: "Using BlockChain",
            Description : "Immutable, privacy-first proof for meaningful learning and achievement.",
            key_importance : [
                "Prevents progress tampering",
                "Preserves data privacy",
                "Strengthens credibility",
                "Enables long-term trust",
            ],
        }
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
            <div className="principles-section">
                {principles.map((item, index) => (
                    <div
                        key={index}
                        className="principle-row"
                        style={{ flexDirection: item.reverse ? "row-reverse" : "row" }}
                    >
                        <div className="principle-text">
                            <h1>
                                {item.Heading1}
                                <br />
                                <span>{item.Heading2}</span>
                            </h1>
                            <p>{item.SubHeading}</p>
                        </div>
                        <div
                            className="principle-box"
                            style={{ background: item.boxColor }}
                        >
                            {item.Points.map((point, idx) => (
                                <div className="principle-point" key={idx}>
                                    <div className="principle-check">
                                        <i className="bx bxs-check-circle"></i>
                                    </div>
                                    <span>{point}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <div className="explore-feature-section">
                <div className="explore-feature-section-header">
                    <h1>What Makes Evolyn Powerful</h1>
                </div>
                <div className="explore-feature-section-subheader">
                    <h3>Core capabilities that transform actions into long-term transformation</h3>
                </div>
            </div>
            <div className="explore-features-container features-grid">
                {FeatureCardData.map((item, index) => (
                    <FeatureCard key={index} {...item} />
                ))}
            </div>
            <Footer />
        </div>
    );
}

export default Explore;
