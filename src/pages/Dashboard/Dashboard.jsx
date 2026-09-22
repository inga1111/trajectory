import { Link, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiTarget,
  FiBarChart2,
  FiSettings,
  FiArrowRight,
  FiCheck,
  FiPlus,
} from "react-icons/fi";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  return (
    <main className="dashboard-page">

      {/* SIDEBAR */}

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

          <a href="#settings" className="nav-item">
            <FiSettings />
            <span>Settings</span>
          </a>

          <div className="profile-mini">
            <div className="profile-avatar">
              I
            </div>

            <div>
              <strong>Inga</strong>
              <span>Your trajectory</span>
            </div>
          </div>

        </div>

      </aside>


      {/* MAIN CONTENT */}

      <section className="dashboard-main">

        <header className="dashboard-header">

          <div>
            <p className="dashboard-eyebrow">
              TUESDAY, 22 SEPTEMBER
            </p>

            <h1>
              Good morning, Inga.
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


        {/* MOMENTUM CARD */}

        <section className="momentum-card">

          <div className="momentum-copy">

            <span className="card-label">
              YOUR MOMENTUM
            </span>

            <h2>
              You're already
              <span> moving.</span>
            </h2>

            <p>
              You've completed 4 tasks this week.
              Keep the momentum going — no need to
              do everything at once.
            </p>

            <Link to="/missions" className="text-link">
              View your missions
              <FiArrowRight />
            </Link>

          </div>

          <div className="momentum-circle">
            <strong>68%</strong>
            <span>momentum</span>
          </div>

        </section>


        {/* TODAY + SIDE CARDS */}

        <div className="dashboard-grid">

          {/* TODAY'S FOCUS */}

          <section className="today-card">

            <div className="section-heading">
              <div>
                <span className="card-label">
                  TODAY'S FOCUS
                </span>

                <h2>
                  One thing at a time.
                </h2>
              </div>

              <span className="task-count">
                2 / 4
              </span>
            </div>


            <div className="task-list">

              <div className="task completed">

                <div className="task-check">
                  <FiCheck />
                </div>

                <div className="task-info">
                  <strong>
                    Check assignment brief
                  </strong>

                  <span>
                    10 min · University
                  </span>
                </div>

              </div>


              <div className="task completed">

                <div className="task-check">
                  <FiCheck />
                </div>

                <div className="task-info">
                  <strong>
                    Gather research notes
                  </strong>

                  <span>
                    20 min · University
                  </span>
                </div>

              </div>


              <div className="task current">

                <div className="task-check"></div>

                <div className="task-info">
                  <strong>
                    Write first paragraph
                  </strong>

                  <span>
                    25 min · Your next step
                  </span>
                </div>

                <FiArrowRight className="task-arrow" />

              </div>


              <div className="task">

                <div className="task-check"></div>

                <div className="task-info">
                  <strong>
                    Take a proper break
                  </strong>

                  <span>
                    15 min · Reset
                  </span>
                </div>

              </div>

            </div>

          </section>


          {/* RIGHT COLUMN */}

          <div className="dashboard-side">


            {/* QUICK WIN */}

            <section className="quick-win-card">

              <span className="card-label">
                QUICK WIN
              </span>

              <h3>
                Do something tiny.
              </h3>

              <p>
                Clear one thing from your
                environment before you start.
              </p>

              <button>
                I'm doing it
                <FiArrowRight />
              </button>

            </section>


            {/* WEEKLY PROGRESS */}

            <section className="weekly-card" id="progress">

              <div className="weekly-heading">
                <span className="card-label">
                  THIS WEEK
                </span>

                <span>4 / 7 days</span>
              </div>

              <div className="week-days">

                <div className="day completed-day">
                  <span>M</span>
                  <i>✓</i>
                </div>

                <div className="day completed-day">
                  <span>T</span>
                  <i>✓</i>
                </div>

                <div className="day today-day">
                  <span>W</span>
                  <i></i>
                </div>

                <div className="day">
                  <span>T</span>
                  <i></i>
                </div>

                <div className="day">
                  <span>F</span>
                  <i></i>
                </div>

                <div className="day">
                  <span>S</span>
                  <i></i>
                </div>

                <div className="day">
                  <span>S</span>
                  <i></i>
                </div>

              </div>

            </section>

          </div>

        </div>


        {/* PERSONALIZED MESSAGE */}

        <section className="trajectory-message">

          <div className="message-symbol">
            ✦
          </div>

          <div>
            <span className="card-label">
              A NOTE FROM TRAJECTORY
            </span>

            <p>
              You don't have to finish everything today.
              Starting is enough. Once you're moving,
              the rest gets easier.
            </p>
          </div>

        </section>

      </section>

    </main>
  );
}

export default Dashboard;