
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiTarget,
  FiZap,
} from "react-icons/fi";
import "./Missions.css";

const initialMissions = [
  {
    id: 1,
    title: "Start that assignment",
    description:
      "Turn the thing you've been putting off into a few manageable steps.",
    category: "Study",
    duration: "15 min",
    difficulty: "Easy start",
    progress: 0,
    status: "Ready",
    icon: <FiTarget />,
  },
  {
    id: 2,
    title: "Reset your space",
    description:
      "Make your environment feel a little calmer, one small area at a time.",
    category: "Daily life",
    duration: "10 min",
    difficulty: "Quick win",
    progress: 2,
    status: "In progress",
    icon: <FiZap />,
  },
  {
    id: 3,
    title: "Get your day together",
    description:
      "Choose what matters today without trying to do everything at once.",
    category: "Planning",
    duration: "5 min",
    difficulty: "Gentle start",
    progress: 0,
    status: "Ready",
    icon: <FiClock />,
  },
  {
    id: 4,
    title: "Take care of yourself",
    description:
      "Make space for one small thing that helps you feel looked after.",
    category: "Wellbeing",
    duration: "10 min",
    difficulty: "At your pace",
    progress: 1,
    status: "In progress",
    icon: <FiCheckCircle />,
  },
];

function Missions() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("All");

  const categories = [
    "All",
    "Study",
    "Daily life",
    "Planning",
    "Wellbeing",
  ];

  const filteredMissions =
    activeFilter === "All"
      ? initialMissions
      : initialMissions.filter(
          (mission) => mission.category === activeFilter
        );

  const handleOpenMission = (mission) => {
    navigate(`/missions/${mission.id}`, {
      state: { mission },
    });
  };

  return (
    <main className="missions-page">
      <header className="missions-header">
        <button
          className="missions-back-button"
          onClick={() => navigate("/dashboard")}
          aria-label="Back to dashboard"
        >
          <FiArrowLeft />
        </button>

        <div className="missions-heading">
          <span className="missions-eyebrow">YOUR NEXT SMALL WIN</span>
          <h1>Your missions</h1>
          <p>
            You don't have to do everything. Just start with one thing.
          </p>
        </div>
      </header>

      <section className="missions-summary">
        <div>
          <span className="missions-summary-label">Your mission board</span>
          <h2>Progress, not perfection.</h2>
          <p>Every small step still counts.</p>
        </div>

        <div className="missions-summary-icon" aria-hidden="true">
          <FiTarget />
        </div>
      </section>

      <section className="missions-list-section">
        <div className="missions-section-heading">
          <div>
            <h2>Find your focus</h2>
            <p>Choose something that feels doable right now.</p>
          </div>
          <span className="missions-count">
            {filteredMissions.length} missions
          </span>
        </div>

        <div
          className="missions-filters"
          aria-label="Filter missions by category"
        >
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

        <div className="missions-grid">
          {filteredMissions.map((mission) => (
            <article className="mission-card" key={mission.id}>
              <div className="mission-card-top">
                <span className="mission-icon">{mission.icon}</span>
                <span
                  className={`mission-status ${
                    mission.status === "In progress"
                      ? "in-progress"
                      : ""
                  }`}
                >
                  {mission.status}
                </span>
              </div>

              <span className="mission-category">
                {mission.category}
              </span>

              <h3>{mission.title}</h3>
              <p className="mission-description">
                {mission.description}
              </p>

              <div className="mission-meta">
                <span>
                  <FiClock />
                  {mission.duration}
                </span>
                <span>{mission.difficulty}</span>
              </div>

              {mission.progress > 0 && (
                <div className="mission-progress">
                  <div className="mission-progress-label">
                    <span>Steps completed</span>
                    <span>{mission.progress}/3</span>
                  </div>
                  <div
                    className="mission-progress-track"
                    role="progressbar"
                    aria-valuenow={mission.progress}
                    aria-valuemin={0}
                    aria-valuemax={3}
                    aria-label={`${mission.title} progress`}
                  >
                    <div
                      className="mission-progress-fill"
                      style={{
                        width: `${(mission.progress / 3) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              <button
                className="mission-open-button"
                onClick={() => handleOpenMission(mission)}
              >
                {mission.status === "In progress"
                  ? "Continue mission"
                  : "Start mission"}
                <FiArrowRight />
              </button>
            </article>
          ))}
        </div>

        {filteredMissions.length === 0 && (
          <p>No missions in this category yet.</p>
        )}
      </section>
    </main>
  );
}

export default Missions;
