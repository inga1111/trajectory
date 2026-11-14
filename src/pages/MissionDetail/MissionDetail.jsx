
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiGift,
  FiTarget,
} from "react-icons/fi";
import "./MissionDetail.css";

const MISSIONS_KEY = "trajectoryMissions";
const PROGRESS_KEY = "trajectoryMissionProgress";
const XP_REWARD = 30;

function MissionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [mission, setMission] = useState(null);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedMissions = JSON.parse(
        localStorage.getItem(MISSIONS_KEY) || "[]"
      );
      const savedProgress = JSON.parse(
        localStorage.getItem(PROGRESS_KEY) || "{}"
      );

      const selectedMission = savedMissions.find(
        (item) => String(item.id) === String(id)
      );

      if (!selectedMission) {
        setMission(null);
        setLoading(false);
        return;
      }

      const progress = savedProgress[selectedMission.id] || {};

      setMission(selectedMission);
      setCompletedSteps(progress.completedSteps || []);
      setIsComplete(progress.completed === true);
    } catch (error) {
      console.error("Could not load mission:", error);
      setMission(null);
    }

    setLoading(false);
  }, [id]);

  const steps = useMemo(() => mission?.steps || [], [mission]);

  const percentage =
    steps.length > 0
      ? Math.round((completedSteps.length / steps.length) * 100)
      : 0;

  function saveProgress(nextCompletedSteps, completed) {
    if (!mission) return;

    try {
      const allProgress = JSON.parse(
        localStorage.getItem(PROGRESS_KEY) || "{}"
      );

      const previousProgress = allProgress[mission.id] || {};

      allProgress[mission.id] = {
        ...previousProgress,
        completedSteps: nextCompletedSteps,
        completed,
        completedAt: completed ? new Date().toISOString() : null,
        xpAwarded: completed
          ? previousProgress.xpAwarded || XP_REWARD
          : previousProgress.xpAwarded || 0,
      };

      localStorage.setItem(PROGRESS_KEY, JSON.stringify(allProgress));
      window.dispatchEvent(new Event("trajectoryProgressUpdated"));
    } catch (error) {
      console.error("Could not save mission progress:", error);
    }
  }

  function toggleStep(index) {
    if (isComplete) return;

    const nextCompletedSteps = completedSteps.includes(index)
      ? completedSteps.filter((step) => step !== index)
      : [...completedSteps, index];

    const nextIsComplete =
      steps.length > 0 && nextCompletedSteps.length === steps.length;

    setCompletedSteps(nextCompletedSteps);
    setIsComplete(nextIsComplete);
    saveProgress(nextCompletedSteps, nextIsComplete);
  }

  if (loading) {
    return <main className="mission-detail-page">Loading mission...</main>;
  }

  if (!mission) {
    return (
      <main className="mission-detail-page">
        <div className="mission-not-found">
          <FiTarget />
          <h1>Mission not found</h1>
          <p>This mission may have been removed or is no longer available.</p>
          <Link to="/missions">Back to missions</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mission-detail-page">
      <div className="mission-detail-container">
        <button
          className="mission-detail-back"
          onClick={() => navigate("/missions")}
        >
          <FiArrowLeft />
          Back to missions
        </button>

        {isComplete ? (
          <section className="mission-completion">
            <div className="mission-completion-icon">
              <FiCheckCircle />
            </div>
            <span className="mission-detail-eyebrow">MISSION COMPLETE</span>
            <h1>You did it!</h1>
            <p>
              You showed up for yourself and followed through. Take a moment
              to enjoy that.
            </p>

            <div className="mission-reward-card">
              <span className="mission-reward-icon">
                <FiGift />
              </span>
              <div>
                <span>YOUR REWARD</span>
                <strong>+{XP_REWARD} XP</strong>
              </div>
            </div>

            <button
              className="mission-continue-button"
              onClick={() => navigate("/missions")}
            >
              Continue to missions
            </button>
          </section>
        ) : (
          <>
            <header className="mission-detail-header">
              <span className="mission-detail-eyebrow">
                {mission.category || "PERSONAL MISSION"}
              </span>
              <span className="mission-detail-icon">
                <FiTarget />
              </span>
              <h1>{mission.title}</h1>
              <p>{mission.description}</p>
              <span className="mission-detail-encouragement">
                {mission.encouragement || "One step at a time. You've got this."}
              </span>
            </header>

            <section className="mission-detail-progress">
              <div className="mission-detail-progress-heading">
                <div>
                  <span>YOUR PROGRESS</span>
                  <h2>{percentage}% complete</h2>
                </div>
                <strong>
                  {completedSteps.length}/{steps.length}
                </strong>
              </div>

              <div className="mission-detail-progress-track">
                <div
                  className="mission-detail-progress-fill"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </section>

            <section className="mission-detail-steps">
              <div className="mission-detail-steps-heading">
                <div>
                  <h2>Let's get it done.</h2>
                  <p>Work through each step at your own pace.</p>
                </div>
                <span>{steps.length} steps</span>
              </div>

              {steps.map((step, index) => {
                const checked = completedSteps.includes(index);

                return (
                  <article
                    className={`mission-detail-step ${
                      checked ? "step-completed" : ""
                    }`}
                    key={`${mission.id}-${index}`}
                  >
                    <button
                      type="button"
                      className="mission-step-checkbox"
                      onClick={() => toggleStep(index)}
                      aria-label={
                        checked
                          ? `Mark ${step.title} incomplete`
                          : `Complete ${step.title}`
                      }
                      aria-pressed={checked}
                    >
                      {checked && <FiCheck />}
                    </button>

                    <div className="mission-step-content">
                      <span>STEP {index + 1}</span>
                      <h3>{step.title}</h3>
                      {step.description && <p>{step.description}</p>}
                      {step.duration && (
                        <small>
                          <FiClock />
                          {step.duration}
                        </small>
                      )}
                    </div>

                    {checked && (
                      <span className="mission-step-done">Done</span>
                    )}
                  </article>
                );
              })}
            </section>

            <div className="mission-detail-footer">
              <span>
                <FiGift />
                Complete all steps to earn {XP_REWARD} XP
              </span>
              <span>{steps.length - completedSteps.length} steps remaining</span>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default MissionDetail;
