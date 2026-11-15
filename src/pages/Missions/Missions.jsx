
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiPlus,
  FiTarget,
  FiZap,
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
        const storedMissions = JSON.parse(localStorage.getItem(MISSIONS_KEY) || "[]");
        const storedProgress = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");

        setMissions(Array.isArray(storedMissions) ? storedMissions : []);
        setProgressData(storedProgress && typeof storedProgress === "object" ? storedProgress : {});
      } catch (error) {
        console.error("Could not load missions:", error);
        setMissions([]);
        setProgressData({});
      }
    };

    loadData();

    const events = [
      "storage",
      "trajectoryMissionsUpdated",
      "trajectoryProgressUpdated",
    ];

    events.forEach((event) => window.addEventListener(event, loadData));

    return () => {
      events.forEach((event) => window.removeEventListener(event, loadData));
    };
  }, []);

  function getProgress(mission) {
    const saved = progressData[mission.id] || {};
    const completedSteps = saved.completedSteps || [];
    const totalSteps = mission.steps?.length || 0;
    const completedCount = completedSteps.length;

    const isComplete =
      saved.completed === true ||
      (totalSteps > 0 && completedCount >= totalSteps);

    const percentage = totalSteps > 0
      ? Math.round((completedCount / totalSteps) * 100)
      : 0;

    return {
      completedCount,
      totalSteps,
      percentage: isComplete ? 100 : percentage,
      isComplete,
      hasStarted: completedCount > 0 && !isComplete,
    };
  }

  const categories = [
    "All",
    ...new Set(missions.map((mission) => mission.category || "Other")),
  ];

  const filteredMissions = useMemo(() => {
    const filtered = activeFilter === "All"
      ? missions
      : missions.filter((mission) => (mission.category || "Other") === activeFilter);

    return [...filtered].sort((a, b) => {
      const aComplete = getProgress(a).isComplete;
      const bComplete = getProgress(b).isComplete;

      if (aComplete === bComplete) {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }

      return aComplete ? 1 : -1;
    });
  }, [missions, progressData, activeFilter]);

  const completedCount = missions.filter((mission) => getProgress(mission).isComplete).length;
  const activeCount = missions.length - completedCount;

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
            <span className="missions-eyebrow">YOUR PERSONAL MISSION BOARD</span>
            <h1>Your missions</h1>
            <p>Big things become easier when you take them one step at a time.</p>
          </div>
        </header>

        <section className="missions-summary">
          <div>
            <span className="missions-summary-label">YOUR PROGRESS</span>
            <h2>Every step moves you forward.</h2>
            <p>
              {missions.length === 0
                ? "Your next achievement starts with a mission."
                : `${completedCount} completed · ${activeCount} still in progress`}
            </p>
          </div>
          <span className="missions-summary-icon"><FiTarget /></span>
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
              <FiPlus /> New mission
            </button>
          </div>

          {missions.length > 0 && (
            <div className="missions-filters">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`missions-filter ${activeFilter === category ? "active" : ""}`}
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
              <span className="missions-empty-icon"><FiTarget /></span>
              <h2>Your mission board is waiting.</h2>
              <p>
                Add something you've been meaning to get done. We'll help you
                break it into smaller, manageable steps.
              </p>
              <button
                className="missions-new-button"
                onClick={() => navigate("/missions/new")}
              >
                <FiPlus /> Create your first mission
              </button>
            </div>
          ) : filteredMissions.length === 0 ? (
            <p className="missions-no-results">No missions in this category yet.</p>
          ) : (
            <>
              {activeCount > 0 && (
                <div className="mission-group-heading">
                  <span>IN PROGRESS</span>
                  <span>{activeCount} mission{activeCount === 1 ? "" : "s"}</span>
                </div>
              )}

              <div className="missions-grid">
                {filteredMissions.filter((mission) => !getProgress(mission).isComplete).map((mission) => {
                  const progress = getProgress(mission);
                  const status = progress.hasStarted ? "In progress" : "Not started";
                  const buttonLabel = progress.hasStarted ? "Continue mission" : "Start mission";

                  return (
                    <article className={`mission-card ${progress.hasStarted ? "mission-card-started" : "mission-card-new"}`} key={mission.id}>
                      <div className="mission-card-decoration" />
                      <div className="mission-card-top">
                        <span className="mission-icon"><FiTarget /></span>
                        <span className={`mission-status ${progress.hasStarted ? "status-progress" : ""}`}>
                          {status}
                        </span>
                      </div>

                      <span className="mission-category">{mission.category || "Personal"}</span>
                      <h3>{mission.title}</h3>
                      <p className="mission-description">{mission.description}</p>

                      <div className="mission-meta">
                        <span><FiClock /> {progress.totalSteps} steps</span>
                        <span>{mission.difficulty || "Your own pace"}</span>
                      </div>

                      <div className="mission-progress-section">
                        <div className="mission-progress-labels">
                          <span>Mission progress</span>
                          <strong>{progress.percentage}%</strong>
                        </div>
                        <div className="mission-progress-track" role="progressbar" aria-valuenow={progress.percentage} aria-valuemin="0" aria-valuemax="100">
                          <div className="mission-progress-fill" style={{ width: `${progress.percentage}%` }} />
                        </div>
                        <span className="mission-steps-count">
                          {progress.completedCount} of {progress.totalSteps} steps completed
                        </span>
                      </div>

                      <Link to={`/missions/${mission.id}`} className="mission-open-button">
                        {buttonLabel} <FiArrowRight />
                      </Link>
                    </article>
                  );
                })}
              </div>

              {completedCount > 0 && activeFilter === "All" && (
                <>
                  <div className="mission-group-heading completed-group-heading">
                    <span>COMPLETED MISSIONS</span>
                    <span>{completedCount} mission{completedCount === 1 ? "" : "s"}</span>
                  </div>

                  <div className="missions-grid">
                    {filteredMissions.filter((mission) => getProgress(mission).isComplete).map((mission) => {
                      const progress = getProgress(mission);

                      return (
                        <article className="mission-card mission-card-completed" key={mission.id}>
                          <div className="mission-card-decoration completed-decoration" />
                          <div className="mission-card-top">
                            <span className="mission-icon"><FiCheckCircle /></span>
                            <span className="mission-status status-completed"><FiCheckCircle /> Completed</span>
                          </div>

                          <span className="mission-category">{mission.category || "Personal"}</span>
                          <h3>{mission.title}</h3>
                          <p className="mission-description">{mission.description}</p>

                          <div className="mission-meta">
                            <span><FiCheckCircle /> {progress.totalSteps} steps completed</span>
                            <span><FiZap /> Mission complete</span>
                          </div>

                          <div className="mission-progress-section">
                            <div className="mission-progress-labels">
                              <span>Mission progress</span><strong>100%</strong>
                            </div>
                            <div className="mission-progress-track">
                              <div className="mission-progress-fill" style={{ width: "100%" }} />
                            </div>
                            <span className="mission-steps-count">You've made it through every step.</span>
                          </div>

                          <Link to={`/missions/${mission.id}`} className="mission-open-button completed-open-button">
                            Review mission <FiArrowRight />
                          </Link>
                        </article>
                      );
                    })}
                  </div>
                </>
              )}

              {activeFilter !== "All" && filteredMissions.length > 0 && (
                <div className="missions-grid">
                  {filteredMissions.filter((mission) => getProgress(mission).isComplete).map((mission) => {
                    const progress = getProgress(mission);
                    return (
                      <article className="mission-card mission-card-completed" key={mission.id}>
                        <div className="mission-card-decoration completed-decoration" />
                        <div className="mission-card-top">
                          <span className="mission-icon"><FiCheckCircle /></span>
                          <span className="mission-status status-completed"><FiCheckCircle /> Completed</span>
                        </div>
                        <span className="mission-category">{mission.category || "Personal"}</span>
                        <h3>{mission.title}</h3>
                        <p className="mission-description">{mission.description}</p>
                        <div className="mission-meta"><span><FiCheckCircle /> {progress.totalSteps} steps completed</span></div>
                        <div className="mission-progress-section">
                          <div className="mission-progress-labels"><span>Mission progress</span><strong>100%</strong></div>
                          <div className="mission-progress-track"><div className="mission-progress-fill" style={{ width: "100%" }} /></div>
                          <span className="mission-steps-count">You've made it through every step.</span>
                        </div>
                        <Link to={`/missions/${mission.id}`} className="mission-open-button completed-open-button">Review mission <FiArrowRight /></Link>
                      </article>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}

export default Missions;
