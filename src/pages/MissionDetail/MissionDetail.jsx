
import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiTarget,
} from "react-icons/fi";
import "./MissionDetail.css";

const missionDetails = {
  1: {
    title: "Start that assignment",
    description:
      "Turn the thing you've been putting off into a few manageable steps.",
    category: "Study",
    duration: "15 min",
    difficulty: "Easy start",
    encouragement: "You don't need to finish everything. Just begin.",
    steps: [
      {
        title: "Open your assignment",
        description: "Find the brief and open the document or workspace.",
        duration: "2 min",
      },
      {
        title: "Figure out the first task",
        description: "Choose one small thing you can work on right now.",
        duration: "3 min",
      },
      {
        title: "Work on it for five minutes",
        description: "Start messy if you need to. You can refine it later.",
        duration: "5 min",
      },
    ],
  },
  2: {
    title: "Reset your space",
    description:
      "Make your environment feel a little calmer, one small area at a time.",
    category: "Daily life",
    duration: "10 min",
    difficulty: "Quick win",
    encouragement: "A little less mess is still progress.",
    steps: [
      {
        title: "Choose one small area",
        description: "Pick a desk, bedside table, or one corner of a room.",
        duration: "1 min",
      },
      {
        title: "Clear away five things",
        description: "Put away, throw out, or move five items.",
        duration: "4 min",
      },
      {
        title: "Make the space usable",
        description: "Put back what you need and take a breath.",
        duration: "5 min",
      },
    ],
  },
  3: {
    title: "Get your day together",
    description:
      "Choose what matters today without trying to do everything at once.",
    category: "Planning",
    duration: "5 min",
    difficulty: "Gentle start",
    encouragement: "Your whole life doesn't need solving today.",
    steps: [
      {
        title: "Brain-dump your tasks",
        description: "Write down what is currently taking up mental space.",
        duration: "2 min",
      },
      {
        title: "Choose one priority",
        description: "Pick the task that matters most today.",
        duration: "1 min",
      },
      {
        title: "Choose your starting action",
        description: "Decide on one tiny action you can take next.",
        duration: "2 min",
      },
    ],
  },
  4: {
    title: "Take care of yourself",
    description:
      "Make space for one small thing that helps you feel looked after.",
    category: "Wellbeing",
    duration: "10 min",
    difficulty: "At your pace",
    encouragement: "You deserve care even when your to-do list isn't finished.",
    steps: [
      {
        title: "Check in with yourself",
        description: "Notice what you might need right now.",
        duration: "2 min",
      },
      {
        title: "Choose one act of care",
        description: "Get a drink, have a snack, stretch, or rest for a moment.",
        duration: "5 min",
      },
      {
        title: "Give yourself a moment",
        description: "Pause without needing to earn the break.",
        duration: "3 min",
      },
    ],
  },
};

function MissionDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const mission =
    missionDetails[id] || location.state?.mission || missionDetails[1];

  const [completedSteps, setCompletedSteps] = useState([]);

  const totalSteps = mission.steps.length;
  const completedCount = completedSteps.length;
  const progress = Math.round((completedCount / totalSteps) * 100);
  const isComplete = completedCount === totalSteps;

  function toggleStep(index) {
    setCompletedSteps((current) =>
      current.includes(index)
        ? current.filter((step) => step !== index)
        : [...current, index]
    );
  }

  return (
    <main className="mission-detail-page">
      <div className="mission-detail-container">
        <button
          className="detail-back-button"
          onClick={() => navigate("/missions")}
        >
          <FiArrowLeft />
          <span>Back to missions</span>
        </button>

        <section className="detail-hero">
          <div className="detail-hero-content">
            <span className="detail-eyebrow">
              {mission.category} MISSION
            </span>

            <h1>{mission.title}</h1>

            <p className="detail-description">{mission.description}</p>

            <div className="detail-meta">
              <span>
                <FiClock />
                {mission.duration}
              </span>
              <span>
                <FiTarget />
                {mission.difficulty}
              </span>
            </div>
          </div>

          <div className="detail-hero-icon" aria-hidden="true">
            <FiTarget />
          </div>
        </section>

        <section className="detail-progress-card">
          <div className="detail-progress-heading">
            <div>
              <span className="detail-small-label">YOUR PROGRESS</span>
              <h2>
                {isComplete
                  ? "Mission accomplished!"
                  : completedCount === 0
                    ? "Every journey starts somewhere."
                    : "You're making progress."}
              </h2>
            </div>

            <span className="detail-progress-percent">{progress}%</span>
          </div>

          <div
            className="detail-progress-track"
            role="progressbar"
            aria-label="Mission progress"
            aria-valuenow={completedCount}
            aria-valuemin={0}
            aria-valuemax={totalSteps}
          >
            <div
              className="detail-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="detail-progress-caption">
            {isComplete
              ? "You showed up for yourself. That's worth celebrating."
              : `${completedCount} of ${totalSteps} steps completed. One step at a time.`}
          </p>
        </section>

        {isComplete ? (
          <section className="detail-completion">
            <div className="detail-completion-icon">
              <FiCheckCircle />
            </div>

            <h2>You did the thing ! </h2>

            <p>
              You made it through this mission, one step at a time. Take a
              moment to appreciate that.
            </p>

            <button
              className="detail-primary-button"
              onClick={() => navigate("/missions")}
            >
              Explore more missions
              <FiArrowRight />
            </button>

            <button
              className="detail-reset-button"
              onClick={() => setCompletedSteps([])}
            >
              Start this mission again
            </button>
          </section>
        ) : (
          <>
            <section className="detail-steps-section">
              <div className="detail-section-heading">
                <span className="detail-small-label">YOUR NEXT MOVES</span>
                <h2>Let's make it manageable.</h2>
                <p>
                  No need to think about everything at once. Focus on the
                  next step.
                </p>
              </div>

              <div className="detail-steps-list">
                {mission.steps.map((step, index) => {
                  const checked = completedSteps.includes(index);

                  return (
                    <article
                      className={`detail-step-card ${checked ? "completed" : ""}`}
                      key={step.title}
                    >
                      <button
                        className="detail-step-check"
                        onClick={() => toggleStep(index)}
                        aria-label={
                          checked
                            ? `Mark ${step.title} as incomplete`
                            : `Mark ${step.title} as complete`
                        }
                        aria-pressed={checked}
                      >
                        {checked && <FiCheck />}
                      </button>

                      <div className="detail-step-content">
                        <span className="detail-step-number">
                          STEP {index + 1}
                        </span>
                        <h3>{step.title}</h3>
                        <p>{step.description}</p>
                      </div>

                      <span className="detail-step-duration">
                        <FiClock />
                        {step.duration}
                      </span>
                    </article>
                  );
                })}
              </div>
            </section>

            <aside className="detail-encouragement">
              <span className="detail-encouragement-mark">“</span>
              <div>
                <span className="detail-small-label">A LITTLE REMINDER</span>
                <p>{mission.encouragement}</p>
              </div>
            </aside>
          </>
        )}
      </div>
    </main>
  );
}

export default MissionDetail;
