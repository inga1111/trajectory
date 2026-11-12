
import { useMemo } from "react";
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
} from "react-icons/fi";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const profile = useMemo(() => {
    try {
      return JSON.parse(
        localStorage.getItem("trajectoryProfile") || "null"
      );
    } catch {
      return null;
    }
  }, []);

  const firstName =
    localStorage.getItem("trajectoryName") || "there";

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
            onClick={() => navigate("/missions")}
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
            <strong>0</strong>
            <span>tasks complete</span>
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
              <span className="card-label">YOUR NEXT STEP</span>

              <h3>Ready for a mission?</h3>

              <p className="routine-description">
                Turn something you've been putting off into
                smaller, more manageable steps.
              </p>

              <Link to="/missions" className="text-link">
                View missions <FiArrowRight />
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
