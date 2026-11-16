
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiPlus,
  FiTarget,
} from "react-icons/fi";
import "./Missions.css";

const MISSIONS_KEY = "trajectoryMissions";
const PROGRESS_KEY = "trajectoryMissionProgress";

function Missions() {
  const navigate = useNavigate();

  const [missions, setMissions] = useState([]);
  const [progressData, setProgressData] = useState({});
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    const loadData = () => {
      try {
        const savedMissions = JSON.parse(
          localStorage.getItem(MISSIONS_KEY) || "[]"
        );

        const savedProgress = JSON.parse(
          localStorage.getItem(PROGRESS_KEY) || "{}"
        );

        setMissions(Array.isArray(savedMissions) ? savedMissions : []);
        setProgressData(
          savedProgress && typeof savedProgress === "object"
            ? savedProgress
            : {}
        );
      } catch (error) {
        console.error("Could not load missions:", error);
        setMissions([]);
        setProgressData({});
      }
    };

    loadData();

    window.addEventListener("storage", loadData);
    window.addEventListener("trajectoryMissionsUpdated", loadData);
    window.addEventListener("trajectoryProgressUpdated", loadData);

    return () => {
      window.removeEventListener("storage", loadData);
      window.removeEventListener("trajectoryMissionsUpdated", loadData);
      window.removeEventListener("trajectoryProgressUpdated", loadData);
    };
  }, []);

  function getProgress(mission) {
    const saved = progressData[mission.id] || {};
    const completedSteps = Array.isArray(saved.completedSteps)
      ? saved.completedSteps
      : [];

    const totalSteps = Array.isArray(mission.steps)
      ? mission.steps.length
      : 0;

    const completedCount = completedSteps.length;

    const isComplete =
      saved.completed === true ||
      (totalSteps > 0 && completedCount >= totalSteps);

    const percentage = isComplete
      ? 100
      : totalSteps > 0
      ? Math.min(100, Math.round((completedCount / totalSteps) * 100))
      : 0;

    return {
      completedCount,
      totalSteps,
      percentage,
      isComplete,
      hasStarted: completedCount > 0 && !isComplete,
    };
  }

  const categories = useMemo(() => {
    return [
      "All",
      ...new Set(missions.map((mission) => mission.category || "Other")),
    ];
  }, [missions]);

  const orderedMissions = useMemo(() => {
    return [...missions].sort((a, b) => {
      const aComplete = getProgress(a).isComplete;
      const bComplete = getProgress(b).isComplete;

      return Number(aComplete) - Number(bComplete);
    });
  }, [missions, progressData]);

  const filteredMissions =
    activeFilter === "All"
      ? orderedMissions
      : orderedMissions.filter(
          (mission) => (mission.category || "Other") === activeFilter
        );

  const completedMissions = missions.filter(
    (mission) => getProgress(mission).isComplete
  ).length;

  return (
    <main className="missions-page">
      <div className="missions-container">
        <header className="missions-header">
          <button
            className="missions-back-button"
            onClick={() => navigate("/dashboard")}
            aria-label="Back to dashboard"
          >
            <FiArrowLeft />
          </button>

          <div className="missions-heading">
            <span className="missions-eyebrow">
              YOUR PERSONAL MISSION BOARD
            </span>
            <h1>Your missions</h1>
            <p>
              Big things become easier when you take them one step at a time.
            </p>
          </div>
        </header>

        <section className="missions-summary">
          <div>
            <span className="missions-summary-label">YOUR PROGRESS</span>
            <h2>Every step moves you forward.</h2>
            <p>
              {missions.length === 0
                ? "Your next achievement starts with a mission."
                : `${completedMissions} of ${missions.length} missions completed`}
            </p>
          </div>

          <span className="missions-summary-icon">
            <FiTarget />
          </span>
        </section>

        <section className="missions-list-section">
          <div className="missions-section-heading">
            <div>
              <h2>Your mission list</h2>
              <p>Choose what you want to focus on.</p>
            </div>

            <button
              className="missions-new-button"
              onClick={() => navigate("/missions/new")}
            >
              <FiPlus />
              New Mission
            </button>
          </div>

          {missions.length > 0 && (
            <div className="missions-filters">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`missions-filter ${
                    activeFilter === category ? "active" : ""
                  }`}
                  onClick={() => setActiveFilter(category)}
                  aria-pressed={activeFilter === category}
                >
                  {category}
                </button>
              ))}
            </div>
          )}

          {missions.length === 0 ? (
            <div className="missions-empty-state">
              <span className="missions-empty-icon">
                <FiTarget />
              </span>

              <h2>Your mission board is waiting.</h2>

              <p>
                Add something you've been meaning to get done. We'll help you
                break it into smaller, manageable steps.
              </p>

              <button
                className="missions-new-button"
                onClick={() => navigate("/missions/new")}
              >
                <FiPlus />
                Create your first mission
              </button>
            </div>
          ) : filteredMissions.length === 0 ? (
            <p className="missions-no-results">
              No missions in this category yet.
            </p>
          ) : (
            <div className="missions-grid">
              {filteredMissions.map((mission) => {
                const progress = getProgress(mission);

                const status = progress.isComplete
                  ? "Mission Complete"
                  : progress.hasStarted
                  ? "In progress"
                  : "Not started";

                const buttonLabel = progress.isComplete
                  ? "Review mission"
                  : progress.hasStarted
                  ? "Continue mission"
                  : "Continue mission";

                return (
                  <article
                    className={`mission-card ${
                      progress.isComplete
                        ? "mission-card-completed"
                        : "mission-card-incomplete"
                    }`}
                    style={{
                      "--mission-overlay-width": progress.isComplete
                        ? "100%"
                        : "40%",
                    }}
                    key={mission.id}
                  >
                    <div className="mission-card-content">
                      <div className="mission-card-top">
                        <span className="mission-icon">
                          <FiTarget />
                        </span>

                        <span
                          className={`mission-status ${
                            progress.isComplete
                              ? "status-completed"
                              : progress.hasStarted
                              ? "status-progress"
                              : ""
                          }`}
                        >
                          {progress.isComplete && <FiCheckCircle />}
                          {status}
                        </span>
                      </div>

                      <span className="mission-category">
                        {mission.category || "Personal"}
                      </span>

                      <h3>{mission.title}</h3>

                      <p className="mission-description">
                        {mission.description ||
                          "A personal mission, broken into manageable steps."}
                      </p>

                      <div className="mission-meta">
                        <span>
                          <FiClock />
                          {progress.totalSteps} steps
                        </span>

                        <span>
                          {mission.difficulty || "Your own pace"}
                        </span>
                      </div>

                      <div className="mission-progress-section">
                        <div className="mission-progress-labels">
                          <span>Mission progress</span>
                          <strong>{progress.percentage}%</strong>
                        </div>

                        <div
                          className="mission-progress-track"
                          role="progressbar"
                          aria-valuenow={progress.percentage}
                          aria-valuemin="0"
                          aria-valuemax="100"
                          aria-label={`${mission.title} progress`}
                        >
                          <div
                            className="mission-progress-fill"
                            style={{
                              width: `${progress.percentage}%`,
                            }}
                          />
                        </div>

                        <span className="mission-steps-count">
                          {progress.completedCount} of {progress.totalSteps}{" "}
                          steps completed
                        </span>
                      </div>

                      <Link
                        to={`/missions/${mission.id}`}
                        className="mission-open-button"
                      >
                        {buttonLabel}
                        <FiArrowRight />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default Missions;
