
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiHome, FiTarget, FiBarChart2, FiSettings, FiArrowRight,
  FiPlus, FiClock, FiHeart, FiZap, FiX, FiAward, FiStar,
  FiCalendar, FiUser, FiCheck, FiMenu
} from "react-icons/fi";
import "./Dashboard.css";

const LEVEL_THRESHOLDS = [0, 100, 250, 450, 700, 1000, 1400, 1850, 2350, 3000];

function readStorage(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

function getLevelInfo(totalXP) {
  let levelIndex = 0;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (totalXP >= LEVEL_THRESHOLDS[i]) levelIndex = i;
  }

  const currentLevelXP = LEVEL_THRESHOLDS[levelIndex];
  const nextLevelXP = LEVEL_THRESHOLDS[levelIndex + 1];

  if (nextLevelXP === undefined) {
    return { level: levelIndex + 1, nextLevelXP: null, progress: 100, remainingXP: 0 };
  }

  return {
    level: levelIndex + 1,
    nextLevelXP,
    progress: Math.min(100, Math.max(0,
      ((totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100
    )),
    remainingXP: nextLevelXP - totalXP,
  };
}

function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(() => readStorage("trajectoryProfile", null));
  const [missions, setMissions] = useState(() => readStorage("trajectoryMissions", []));
  const [progress, setProgress] = useState(() => readStorage("trajectoryMissionProgress", {}));
  const [rewards, setRewards] = useState(() => readStorage("trajectoryRewards", {
    totalXP: 0, unlockedAchievements: []
  }));
  const [firstName, setFirstName] = useState(() => localStorage.getItem("trajectoryName") || "");
  const [showMissionPrompt, setShowMissionPrompt] = useState(() => {
    const savedProfile = readStorage("trajectoryProfile", null);
    const savedMissions = readStorage("trajectoryMissions", []);
    return Boolean(savedProfile && savedMissions.length === 0 &&
      localStorage.getItem("trajectoryMissionPromptDismissed") !== "true");
  });

  useEffect(() => {
    const refresh = () => {
      setProfile(readStorage("trajectoryProfile", null));
      setMissions(readStorage("trajectoryMissions", []));
      setProgress(readStorage("trajectoryMissionProgress", {}));
      setRewards(readStorage("trajectoryRewards", { totalXP: 0, unlockedAchievements: [] }));
      setFirstName(localStorage.getItem("trajectoryName") || "");
    };

    const events = [
      "trajectoryMissionsUpdated", "trajectoryProgressUpdated",
      "trajectoryRewardsUpdated", "trajectoryProfileUpdated",
      "trajectoryNameUpdated", "storage"
    ];
    events.forEach((event) => window.addEventListener(event, refresh));
    return () => events.forEach((event) => window.removeEventListener(event, refresh));
  }, []);

  const totalMissions = missions.length;
  const completedMissions = missions.filter(
    (mission) => progress[mission.id]?.completed === true
  ).length;
  const totalSteps = missions.reduce((total, mission) => total + (mission.steps?.length || 0), 0);
  const completedSteps = missions.reduce((total, mission) => {
    return total + (progress[mission.id]?.completedSteps?.length || 0);
  }, 0);

  const totalXP = rewards.totalXP || 0;
  const levelInfo = getLevelInfo(totalXP);
  const achievementCount = rewards.unlockedAchievements?.length || 0;

  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good morning" :
    now.getHours() < 18 ? "Good afternoon" : "Good evening";
  const date = now.toLocaleDateString("en-ZA", {
    weekday: "long", day: "numeric", month: "long"
  });

  const displayName = firstName.trim() || "there";

  const profileItems = [
    { icon: <FiTarget />, label: "Main challenge", value: profile?.mainChallenge || "Not yet identified" },
    { icon: <FiZap />, label: "Preferred approach", value: profile?.preferredApproach || "Not yet identified" },
    { icon: <FiClock />, label: "Working style", value: profile?.workStyle || "Not yet identified" },
    { icon: <FiHeart />, label: "Motivation", value: profile?.motivationStyle || "Not yet identified" },
  ];

  const mascotMessage = completedSteps > 0
    ? "Look at you making progress. Every little step counts. Keep going!"
    : totalMissions > 0
      ? "You don't need to finish the whole mission right now. Just choose your next tiny step."
      : "Hey, you. We don't need a perfect plan. We just need somewhere to start.";

  function dismissMissionPrompt() {
    localStorage.setItem("trajectoryMissionPromptDismissed", "true");
    setShowMissionPrompt(false);
  }

  return (
    <main className="dashboard-page">
      {showMissionPrompt && (
        <div className="mission-prompt-backdrop">
          <div className="mission-prompt">
            <button className="prompt-close" onClick={dismissMissionPrompt} aria-label="Close">
              <FiX />
            </button>
            <div className="prompt-star">✦</div>
            <span className="card-label">YOUR JOURNEY STARTS HERE</span>
            <h2>Ready for your first mission?</h2>
            <p>Choose something you've been meaning to do. We'll help you turn it into smaller, more manageable steps.</p>
            <button className="add-task-button prompt-primary" onClick={() => navigate("/missions/new")}>
              <FiPlus /> Create my first mission
            </button>
            <button className="prompt-dismiss" onClick={dismissMissionPrompt}>I'll do this later</button>
          </div>
        </div>
      )}

      <aside className="dashboard-sidebar">
        <Link to="/" className="dashboard-logo">trajectory.</Link>

        <nav className="dashboard-nav">
          <Link to="/dashboard" className="nav-item active"><FiHome /><span>Today</span></Link>
          <Link to="/missions" className="nav-item"><FiTarget /><span>Missions</span></Link>
          <Link to="/calendar" className="nav-item"><FiCalendar /><span>Calendar</span></Link>
          <Link to="/timer" className="nav-item"><FiClock /><span>Focus timer</span></Link>
          <Link to="/rewards" className="nav-item"><FiAward /><span>Rewards</span></Link>
          <a href="#progress" className="nav-item"><FiBarChart2 /><span>Progress</span></a>
        </nav>

        <div className="sidebar-bottom">
          <Link to="/profile" className="nav-item"><FiSettings /><span>My profile</span></Link>
          <Link to="/profile" className="profile-mini">
            <div className="profile-avatar">{displayName.charAt(0).toUpperCase()}</div>
            <div><strong>{displayName}</strong><span>Your trajectory</span></div>
            <Link to="/assistant" className="nav-item">
            <FiZap />
            <span>AI companion</span>
            </Link>
          </Link>
        </div>
      </aside>

      <section className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="dashboard-eyebrow">{date}</p>
            <h1><span className="dashboard-greeting">{greeting},</span> <span className="rainbow-name">{displayName}.</span></h1>
            <p>Let's make today feel a little less overwhelming.</p>
          </div>
          <button className="add-task-button" onClick={() => navigate("/missions/new")}>
            <FiPlus /> New mission
          </button>
        </header>

        <section className="momentum-card">
          <div className="momentum-copy">
            <span className="card-label">YOUR TRAJECTORY</span>
            <h2>Progress at <span>your pace.</span></h2>
            <p>You don't need to do everything at once. Your journey starts with one manageable step.</p>
            <Link to="/missions" className="text-link">Explore your missions <FiArrowRight /></Link>
          </div>
          <div className="momentum-circle">
            <strong>{completedMissions} / {totalMissions}</strong>
            <span>missions complete</span>
          </div>
        </section>

        <div className="dashboard-grid">
          <section className="today-card">
            <div className="section-heading">
              <div><span className="card-label">YOUR PRODUCTIVITY PROFILE</span><h2>How you work best.</h2></div>
              <Link to="/profile" className="profile-edit-link">Edit profile <FiArrowRight /></Link>
            </div>

            {profile ? (
              <div className="task-list">
                {profileItems.map((item) => (
                  <div className="task profile-task" key={item.label}>
                    <div className="profile-task-icon">{item.icon}</div>
                    <div className="task-info"><span>{item.label}</span><strong>{item.value}</strong></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="profile-empty">
                <h3>Your profile is waiting.</h3>
                <p>Complete your onboarding questionnaire so Trajectory can personalise your experience.</p>
                <button className="profile-action" onClick={() => navigate("/questionnaire")}>
                  Complete questionnaire <FiArrowRight />
                </button>
              </div>
            )}
          </section>

          <div className="dashboard-side">
            <section className="weekly-card">
              <span className="card-label">YOUR RECOMMENDED ROUTINE</span>
              <h3 className="routine-time">{profile?.recommendedSessionLength || "25 minutes"}</h3>
              <p className="routine-description">Suggested focus session</p>
              <Link to="/timer" className="text-link"><FiClock /> Start a focus session <FiArrowRight /></Link>
              <div className="routine-divider" />
              <span className="card-label">PLANNING APPROACH</span>
              <p className="routine-value">{profile?.planningStyle?.replaceAll("-", " ") || "Balanced"}</p>
              <p className="routine-description">Based on your onboarding answers.</p>
            </section>

            <section className="weekly-card" id="progress">
              <span className="card-label">YOUR PROGRESS</span>
              <h3>{totalMissions === 0 ? "Your progress starts here." : `${completedMissions} of ${totalMissions} missions completed`}</h3>
              <p className="routine-description">{completedSteps} of {totalSteps} steps completed</p>
              {totalMissions > 0 && (
                <div className="dashboard-progress-track">
                  <div className="dashboard-progress-fill" style={{ width: `${totalSteps > 0 ? completedSteps / totalSteps * 100 : 0}%` }} />
                </div>
              )}
              <Link to="/missions" className="text-link">{totalMissions === 0 ? "Create a mission" : "View your missions"} <FiArrowRight /></Link>
            </section>

            <section className="weekly-card rewards-preview">
              <div className="rewards-preview-heading"><span className="card-label">YOUR REWARDS</span><FiAward /></div>
              <div className="rewards-level"><div className="rewards-star"><FiStar /></div><div><span>CURRENT LEVEL</span><strong>Level {levelInfo.level}</strong></div></div>
              <div className="rewards-xp-row"><strong>{totalXP.toLocaleString()} XP</strong><span>{levelInfo.nextLevelXP !== null ? `${levelInfo.remainingXP} XP to next level` : "Maximum level reached!"}</span></div>
              <div className="dashboard-progress-track xp-track"><div className="dashboard-progress-fill xp-fill" style={{ width: `${levelInfo.progress}%` }} /></div>
              <p className="routine-description">{achievementCount} achievement{achievementCount === 1 ? "" : "s"} unlocked</p>
              <Link to="/rewards" className="text-link">View your rewards <FiArrowRight /></Link>
            </section>
          </div>
        </div>

        <section className="trajectory-message">
          <div className="message-symbol">✦</div>
          <div><span className="card-label">A NOTE FROM TRAJECTORY</span><p>{profile?.encouragement || "You don't have to finish everything today. Starting is enough."}</p></div>
        </section>

        <section className="star-companion" aria-label="Trajectory star companion">
          <div className="companion-star">★</div>
          <div><span className="card-label">A LITTLE REMINDER</span><p>{mascotMessage}</p></div>
        </section>
      </section>
    </main>
  );
}

export default Dashboard;
