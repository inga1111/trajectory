
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiPlus,
  FiTarget,
  FiTrash2,
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
        setMissions(
          JSON.parse(localStorage.getItem(MISSIONS_KEY) || "[]")
        );
        setProgressData(
          JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}")
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

  const categories = [
    "All",
    ...new Set(missions.map((mission) => mission.category || "Other")),
  ];

  function getProgress(mission) {
    const saved = progressData[mission.id] || {};
    const completedSteps = saved.completedSteps || [];
    const totalSteps = mission.steps?.length || 0;

    const completedCount = completedSteps.length;
    const percentage =
      totalSteps > 0
        ? Math.round((completedCount / totalSteps) * 100)
        : 0;

    const isComplete =
      saved.completed === true ||
      (totalSteps > 0 && completedCount >= totalSteps);

    return {
      completedCount,
      totalSteps,
      percentage: isComplete ? 100 : percentage,
      isComplete,
      hasStarted: completedCount > 0 && !isComplete,
    };
  }

  function deleteMission(mission) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${mission.title}"? This will remove its saved progress too.`
    );

    if (!confirmed) return;

    const updatedMissions = missions.filter(
      (item) => item.id !== mission.id
    );

    const updatedProgress = { ...progressData };
    delete updatedProgress[mission.id];

    localStorage.setItem(MISSIONS_KEY, JSON.stringify(updatedMissions));
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(updatedProgress));

    setMissions(updatedMissions);
    setProgressData(updatedProgress);

    window.dispatchEvent(new Event("trajectoryMissionsUpdated"));
    window.dispatchEvent(new Event("trajectoryProgressUpdated"));
  }

  const filteredMissions =
    activeFilter === "All"
      ? missions
      : missions.filter(
          (mission) => (mission.category || "Other") === activeFilter
        );

  const sortedMissions = [...filteredMissions].sort((a, b) => {
    const aComplete = getProgress(a).isComplete;
    const bComplete = getProgress(b).isComplete;

    return Number(aComplete) - Number(bComplete);
  });

  const completedCount = missions.filter(
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
                : `${completedCount} of ${missions.length} missions completed`}
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
              New mission
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
          ) : (
            <div className="missions-grid">
              {sortedMissions.map((mission) => {
                const progress = getProgress(mission);

                const status = progress.isComplete
                  ? "Completed"
                  : progress.hasStarted
                  ? "In progress"
                  : "Not started";

                const buttonLabel = progress.isComplete
                  ? "Review mission"
                  : progress.hasStarted
                  ? "Continue mission"
                  : "Start mission";

                return (
                  <article
                    className={`mission-card ${
                      progress.isComplete
                        ? "mission-card-completed"
                        : "mission-card-active"
                    }`}
                    key={mission.id}
                  >
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

                      <button
                        className="mission-delete-button"
                        onClick={() => deleteMission(mission)}
                        aria-label={`Delete ${mission.title}`}
                        title="Delete mission"
                      >
                        <FiTrash2 />
                      </button>
                    </div>

                    <span className="mission-category">
                      {mission.category || "Personal"}
                    </span>

                    <h3>{mission.title}</h3>

                    <p className="mission-description">
                      {mission.description}
                    </p>

                    <div className="mission-meta">
                      <span>
                        <FiClock />
                        {progress.totalSteps} steps
                      </span>
                      <span>{mission.difficulty || "Your own pace"}</span>
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
                      >
                        <div
                          className="mission-progress-fill"
                          style={{ width: `${progress.percentage}%` }}
                        />
                      </div>

                      <span className="mission-steps-count">
                        {progress.completedCount} of {progress.totalSteps} steps completed
                      </span>
                    </div>

                    <Link
                      to={`/missions/${mission.id}`}
                      className="mission-open-button"
                    >
                      {buttonLabel}
                      <FiArrowRight />
                    </Link>

                    <div
                      className={`mission-visual-overlay ${
                        progress.isComplete
                          ? "completed-overlay"
                          : "active-overlay"
                      }`}
                      aria-hidden="true"
                    >
                      {progress.isComplete ? (
                        <span className="overlay-message">
                          <FiCheckCircle />
                          Mission Complete
                        </span>
                      ) : (
                        <span className="overlay-message">
                          {progress.percentage}% complete
                        </span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {missions.length > 0 && filteredMissions.length === 0 && (
            <p className="missions-no-results">
              No missions in this category yet.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}

export default Missions;
