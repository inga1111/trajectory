
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

const FILTERS = [
  { id: "all", label: "All" },
  { id: "not-started", label: "Not started" },
  { id: "in-progress", label: "In progress" },
  { id: "completed", label: "Completed" },
];

function getMissionProgress(mission, progressData) {
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

  const hasStarted =
    !isComplete &&
    (saved.started === true || completedCount > 0);

  const percentage = isComplete
    ? 100
    : totalSteps > 0
      ? Math.min(
          100,
          Math.round((completedCount / totalSteps) * 100)
        )
      : 0;

  return {
    completedCount,
    totalSteps,
    percentage,
    isComplete,
    hasStarted,
    status: isComplete
      ? "completed"
      : hasStarted
        ? "in-progress"
        : "not-started",
  };
}

function Missions() {
  const navigate = useNavigate();

  const [missions, setMissions] = useState([]);
  const [progressData, setProgressData] = useState({});
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    const loadData = () => {
      try {
        const savedMissions = JSON.parse(
          localStorage.getItem(MISSIONS_KEY) || "[]"
        );

        const savedProgress = JSON.parse(
          localStorage.getItem(PROGRESS_KEY) || "{}"
        );

        setMissions(
          Array.isArray(savedMissions) ? savedMissions : []
        );

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

  const groups = useMemo(() => {
    const ordered = [...missions].sort(
      (a, b) =>
        new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0)
    );

    return {
      "not-started": ordered.filter(
        (mission) =>
          getMissionProgress(mission, progressData).status ===
          "not-started"
      ),

      "in-progress": ordered.filter(
        (mission) =>
          getMissionProgress(mission, progressData).status ===
          "in-progress"
      ),

      completed: ordered.filter(
        (mission) =>
          getMissionProgress(mission, progressData).status ===
          "completed"
      ),
    };
  }, [missions, progressData]);

  const totalCompleted = groups.completed.length;
  const completionPercentage = missions.length
    ? Math.round((totalCompleted / missions.length) * 100)
    : 0;

  const visibleGroups =
    activeFilter === "all"
      ? [
          {
            id: "not-started",
            title: "Not started",
            subtitle: "Ready when you are.",
            items: groups["not-started"],
          },
          {
            id: "in-progress",
            title: "In progress",
            subtitle: "Your current focus.",
            items: groups["in-progress"],
          },
          {
            id: "completed",
            title: "Completed",
            subtitle: "Look at everything you've done.",
            items: groups.completed,
          },
        ]
      : [
          {
            id: activeFilter,
            title: FILTERS.find(
              (filter) => filter.id === activeFilter
            )?.label,
            subtitle:
              activeFilter === "completed"
                ? "Look at everything you've done."
                : activeFilter === "in-progress"
                  ? "Your current focus."
                  : "Ready when you are.",
            items: groups[activeFilter],
          },
        ];

  function renderMission(mission) {
    const progress = getMissionProgress(
      mission,
      progressData
    );

    const status = progress.isComplete
      ? "Mission Complete"
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
            : "mission-card-incomplete"
        }`}
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
              {progress.completedCount} of{" "}
              {progress.totalSteps} steps completed
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
  }

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
              Big things become easier when you take them
              one step at a time.
            </p>
          </div>
          <button
            className="missions-new-button"
            onClick={() => navigate("/missions/new")}
          >
            <FiPlus />
            New mission
          </button>
        </header>

        <section className="missions-summary">
          <div className="missions-summary-copy">
            <span className="missions-summary-label">
              YOUR PROGRESS
            </span>

            <h2>Every step moves you forward.</h2>

            <p>
              {missions.length === 0
                ? "Your next achievement starts with a mission."
                : `${totalCompleted} of ${missions.length} missions completed`}
            </p>

            <div
              className="missions-summary-track"
              role="progressbar"
              aria-valuenow={completionPercentage}
              aria-valuemin="0"
              aria-valuemax="100"
              aria-label="Missions completed"
            >
              <span style={{ width: `${completionPercentage}%` }} />
            </div>
          </div>

          <div className="missions-summary-stats">
            <div>
              <strong>{missions.length}</strong>
              <span>Total missions</span>
            </div>
            <div>
              <strong>{groups["in-progress"].length}</strong>
              <span>In progress</span>
            </div>
            <div>
              <strong>{totalCompleted}</strong>
              <span>Completed</span>
            </div>
          </div>
        </section>

        <section className="missions-list-section">
          <div className="missions-section-heading">
            <div>
              <h2>Your mission list</h2>
              <p>Choose what you want to focus on.</p>
            </div>
          </div>

          {missions.length > 0 && (
            <div
              className="missions-filters"
              role="group"
              aria-label="Filter missions by status"
            >
              {FILTERS.map((filter) => {
                const count =
                  filter.id === "all"
                    ? missions.length
                    : groups[filter.id].length;

                return (
                  <button
                    key={filter.id}
                    className={`missions-filter ${
                      activeFilter === filter.id ? "active" : ""
                    }`}
                    onClick={() =>
                      setActiveFilter(filter.id)
                    }
                    aria-pressed={
                      activeFilter === filter.id
                    }
                  >
                    {filter.label}
                    <span className="missions-filter-count">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {missions.length === 0 ? (
            <div className="missions-empty-state">
              <span className="missions-empty-icon">
                <FiTarget />
              </span>

              <h2>Your mission board is waiting.</h2>

              <p>
                Add something you've been meaning to get done.
                We'll help you break it into smaller,
                manageable steps.
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
            <div className="missions-groups">
              {visibleGroups
                .filter(
                  (group) =>
                    group.items.length > 0 || activeFilter !== "all"
                )
                .map((group) => (
                  <section
                    className="mission-status-group"
                    key={group.id}
                  >
                    <div className="mission-status-heading">
                      <div>
                        <h3>{group.title}</h3>
                        <p>{group.subtitle}</p>
                      </div>

                      <span>{group.items.length}</span>
                    </div>

                    {group.items.length > 0 ? (
                      <div className="missions-grid">
                        {group.items.map(renderMission)}
                      </div>
                    ) : (
                      <p className="missions-no-results">
                        {activeFilter === "all"
                          ? "Nothing here just yet."
                          : "No missions in this section yet."}
                      </p>
                    )}
                  </section>
                ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default Missions;
