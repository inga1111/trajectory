
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiTarget,
  FiBarChart2,
  FiSettings,
  FiArrowRight,
  FiPlus,
  FiClock,
  FiHeart,
  FiZap,
  FiX,
  FiAward,
} from "react-icons/fi";
import "./Dashboard.css";

function readStorage(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

function Dashboard() {
  const navigate = useNavigate();

  const [profile] = useState(() =>
    readStorage("trajectoryProfile", null)
  );

  const [missions, setMissions] = useState(() =>
    readStorage("trajectoryMissions", [])
  );

  const [progress, setProgress] = useState(() =>
    readStorage("trajectoryMissionProgress", {})
  );

  const [showMissionPrompt, setShowMissionPrompt] = useState(() => {
    const savedProfile = readStorage("trajectoryProfile", null);
    const savedMissions = readStorage("trajectoryMissions", []);
    const dismissed =
      localStorage.getItem("trajectoryMissionPromptDismissed") === "true";

    return Boolean(
      savedProfile &&
      savedMissions.length === 0 &&
      !dismissed
    );
  });

  const firstName =
    localStorage.getItem("trajectoryName") || "there";

  useEffect(() => {
    const refreshDashboard = () => {
      const updatedMissions = readStorage("trajectoryMissions", []);
      const updatedProgress = readStorage(
        "trajectoryMissionProgress",
        {}
      );

      setMissions(updatedMissions);
      setProgress(updatedProgress);

      if (updatedMissions.length > 0) {
        setShowMissionPrompt(false);
      }
    };

    window.addEventListener(
      "trajectoryMissionsUpdated",
      refreshDashboard
    );

    window.addEventListener(
      "trajectoryProgressUpdated",
      refreshDashboard
    );

    window.addEventListener("storage", refreshDashboard);

    return () => {
      window.removeEventListener(
        "trajectoryMissionsUpdated",
        refreshDashboard
      );

      window.removeEventListener(
        "trajectoryProgressUpdated",
        refreshDashboard
      );

      window.removeEventListener("storage", refreshDashboard);
    };
  }, []);

  const dismissMissionPrompt = () => {
    localStorage.setItem(
      "trajectoryMissionPromptDismissed",
      "true"
    );
    setShowMissionPrompt(false);
  };

  const totalMissions = missions.length;

  const completedMissions = missions.filter(
    (mission) => progress[mission.id]?.completed === true
  ).length;

  const totalSteps = missions.reduce(
    (total, mission) => total + (mission.steps?.length || 0),
    0
  );

  const completedSteps = missions.reduce((total, mission) => {
    const missionProgress = progress[mission.id];
    return total + (missionProgress?.completedSteps?.length || 0);
  }, 0);

  const today = new Date();

  const greeting =
    today.getHours() < 12
      ? "Good morning"
      : today.getHours() < 18
      ? "Good afternoon"
      : "Good evening";

  const date = today.toLocaleDateString("en-ZA", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const profileItems = [
    {
      icon: <FiTarget />,
      label: "Main challenge",
      value: profile?.mainChallenge || "Not yet identified",
    },
    {
      icon: <FiZap />,
      label: "Preferred approach",
      value: profile?.preferredApproach || "Not yet identified",
    },
    {
      icon: <FiClock />,
      label: "Working style",
      value: profile?.workStyle || "Not yet identified",
    },
    {
      icon: <FiHeart />,
      label: "Motivation",
      value: profile?.motivationStyle || "Not yet identified",
    },
  ];

  return (
    <main className="dashboard-page">
      {showMissionPrompt && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(20, 15, 35, 0.65)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              position: "relative",
              background: "#fff",
              borderRadius: "24px",
              padding: "40px",
              width: "100%",
              maxWidth: "460px",
              textAlign: "center",
              boxShadow: "0 20px 70px rgba(0,0,0,0.2)",
            }}
          >
            <button
              onClick={dismissMissionPrompt}
              aria-label="Close"
              style={{
                position: "absolute",
                top: "18px",
                right: "18px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: "20px",
              }}
            >
              <FiX />
            </button>

            <div style={{ fontSize: "42px", marginBottom: "14px" }}>
              ✦
            </div>

            <span className="card-label">
              YOUR JOURNEY STARTS HERE
            </span>

            <h2 style={{ fontSize: "26px", margin: "12px 0" }}>
              Ready for your first mission?
            </h2>

            <p
              style={{
                color: "#777",
                lineHeight: 1.6,
                marginBottom: "26px",
              }}
            >
              Choose something you've been meaning to do.
              We'll help you turn it into smaller, more
              manageable steps.
            </p>

            <button
              className="add-task-button"
              style={{
                width: "100%",
                justifyContent: "center",
                marginBottom: "14px",
              }}
              onClick={() => navigate("/missions/new")}
            >
              <FiPlus />
              Create my first mission
            </button>

            <button
              onClick={dismissMissionPrompt}
              style={{
                border: "none",
                background: "transparent",
                color: "#777",
                cursor: "pointer",
                padding: "10px",
                fontSize: "14px",
              }}
            >
              I'll do this later
            </button>
          </div>
        </div>
      )}

      <aside className="dashboard-sidebar">
        <Link to="/" className="dashboard-logo">
          trajectory.
        </Link>

        <nav className="dashboard-nav">
          <Link to="/dashboard" className="nav-item active">
            <FiHome />
            <span>Today</span>
          </Link>

          <Link to="/missions" className="nav-item">
            <FiTarget />
            <span>Missions</span>
          </Link>

          <Link to="/rewards" className="nav-item">
            <FiAward />
            <span>Rewards</span>
          </Link>

          <a href="#progress" className="nav-item">
            <FiBarChart2 />
            <span>Progress</span>
          </a>
        </nav>

        <div className="sidebar-bottom">
          <a href="#profile" className="nav-item">
            <FiSettings />
            <span>My profile</span>
          </a>

          <div className="profile-mini">
            <div className="profile-avatar">
              {firstName.charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{firstName}</strong>
              <span>Your trajectory</span>
            </div>
          </div>
        </div>
      </aside>

      <section className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="dashboard-eyebrow">{date}</p>

            <h1>
              {greeting}, {firstName}.
            </h1>

            <p>
              Let's make today feel a little less overwhelming.
            </p>
          </div>

          <button
            className="add-task-button"
            onClick={() => navigate("/missions/new")}
          >
            <FiPlus />
            New mission
          </button>
        </header>

        <section className="momentum-card">
          <div className="momentum-copy">
            <span className="card-label">YOUR TRAJECTORY</span>

            <h2>
              Progress at
              <span> your pace.</span>
            </h2>

            <p>
              You don't need to do everything at once.
              Your journey starts with one manageable step.
            </p>

            <Link to="/missions" className="text-link">
              Explore your missions
              <FiArrowRight />
            </Link>
          </div>

          <div className="momentum-circle">
            <strong>
              {completedMissions} / {totalMissions}
            </strong>
            <span>missions complete</span>
          </div>
        </section>

        <div className="dashboard-grid">
          <section className="today-card" id="profile">
            <div className="section-heading">
              <div>
                <span className="card-label">
                  YOUR PRODUCTIVITY PROFILE
                </span>

                <h2>How you work best.</h2>
              </div>
            </div>

            {profile ? (
              <div className="task-list">
                {profileItems.map((item) => (
                  <div className="task profile-task" key={item.label}>
                    <div className="profile-task-icon">
                      {item.icon}
                    </div>

                    <div className="task-info">
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="profile-empty">
                <h3>Your profile is waiting.</h3>
                <p>
                  Complete your onboarding questionnaire so
                  Trajectory can personalise your experience.
                </p>

                <button
                  className="profile-action"
                  onClick={() => navigate("/questionnaire")}
                >
                  Complete questionnaire <FiArrowRight />
                </button>
              </div>
            )}
          </section>

          <div className="dashboard-side">
            <section className="weekly-card">
              <span className="card-label">
                YOUR RECOMMENDED ROUTINE
              </span>

              <h3 className="routine-time">
                {profile?.recommendedSessionLength || "25 minutes"}
              </h3>

              <p className="routine-description">
                Suggested focus session
              </p>

              <div className="routine-divider" />

              <span className="card-label">
                PLANNING APPROACH
              </span>

              <p className="routine-value">
                {profile?.planningStyle
                  ? profile.planningStyle.replaceAll("-", " ")
                  : "Balanced"}
              </p>

              <p className="routine-description">
                Based on your onboarding answers.
              </p>
            </section>

            <section className="weekly-card" id="progress">
              <span className="card-label">YOUR PROGRESS</span>

              <h3>
                {totalMissions === 0
                  ? "Your progress starts here."
                  : `${completedMissions} of ${totalMissions} missions completed`}
              </h3>

              <p className="routine-description">
                {completedSteps} of {totalSteps} steps completed
              </p>

              {totalMissions > 0 && (
                <div
                  style={{
                    height: "8px",
                    background: "#eee",
                    borderRadius: "20px",
                    overflow: "hidden",
                    margin: "14px 0",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${
                        totalSteps > 0
                          ? (completedSteps / totalSteps) * 100
                          : 0
                      }%`,
                      background: "#8b70c9",
                      borderRadius: "20px",
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>
              )}

              <Link to="/missions" className="text-link">
                {totalMissions === 0
                  ? "Create a mission"
                  : "View your missions"}
                <FiArrowRight />
              </Link>
            </section>
          </div>
        </div>

        <section className="trajectory-message">
          <div className="message-symbol">✦</div>

          <div>
            <span className="card-label">
              A NOTE FROM TRAJECTORY
            </span>

            <p>
              {profile?.encouragement ||
                "You don't have to finish everything today. Starting is enough."}
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}

export default Dashboard;
