
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiHome, FiTarget, FiBarChart2, FiSettings, FiArrowRight,
  FiPlus, FiClock, FiHeart, FiZap, FiX, FiAward, FiStar,
  FiCalendar
} from "react-icons/fi";
import { supabase } from "../../lib/supabase";
import trajectoryMascot from "../../assets/trajectory-mascot.png";
import "./Dashboard.css";

const LEVEL_THRESHOLDS = [0, 100, 250, 450, 700, 1000, 1400, 1850, 2350, 3000];

function readStorage(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

function getDashboardProfile() {
  const savedProfile = readStorage("trajectoryProfile", null);
  if (savedProfile) return savedProfile;

  const onboarding = readStorage("trajectoryOnboarding", null);
  if (!onboarding?.completed || !Array.isArray(onboarding.answers)) return null;

  const answers = onboarding.answers;
  const workStyle = answers[2]?.answer || "";
  const preferredApproach = answers[1]?.answer || "";

  return {
    mainChallenge: answers[0]?.answer || "Not yet identified",
    preferredApproach: preferredApproach || "Not yet identified",
    workStyle: workStyle || "Not yet identified",
    motivationStyle: answers[3]?.answer || "Not yet identified",
    recommendedSessionLength: workStyle === "Short bursts with breaks"
      ? "15 minutes"
      : "25 minutes",
    planningStyle: preferredApproach || "Balanced",
  };
}

function getLevelInfo(totalXP) {
  let levelIndex = 0;

  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (totalXP >= LEVEL_THRESHOLDS[i]) levelIndex = i;
  }

  const currentLevelXP = LEVEL_THRESHOLDS[levelIndex];
  const nextLevelXP = LEVEL_THRESHOLDS[levelIndex + 1];

  if (nextLevelXP === undefined) {
    return {
      level: levelIndex + 1,
      nextLevelXP: null,
      progress: 100,
      remainingXP: 0
    };
  }

  return {
    level: levelIndex + 1,
    nextLevelXP,
    progress: Math.min(
      100,
      Math.max(
        0,
        ((totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100
      )
    ),
    remainingXP: nextLevelXP - totalXP
  };
}

function Dashboard() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(() => getDashboardProfile());

  const [missions, setMissions] = useState(() =>
    readStorage("trajectoryMissions", [])
  );

  const [progress, setProgress] = useState(() =>
    readStorage("trajectoryMissionProgress", {})
  );

  const [rewards, setRewards] = useState(() =>
    readStorage("trajectoryRewards", {
      totalXP: 0,
      unlockedAchievements: []
    })
  );

  const [firstName, setFirstName] = useState(
    () => localStorage.getItem("trajectoryName") || ""
  );

  const [showProductivityHighlight, setShowProductivityHighlight] = useState(
    () => localStorage.getItem("trajectoryProfileHighlightPending") === "true"
  );

  const [showMissionPrompt, setShowMissionPrompt] = useState(() => {
    const savedProfile = getDashboardProfile();
    const savedMissions = readStorage("trajectoryMissions", []);
    const hasPendingProfileHighlight =
      localStorage.getItem("trajectoryProfileHighlightPending") === "true";

    return Boolean(
      savedProfile &&
      !hasPendingProfileHighlight &&
      savedMissions.length === 0 &&
      localStorage.getItem("trajectoryMissionPromptDismissed") !== "true"
    );
  });

  // Retrieve the authenticated user's name from Supabase.
  useEffect(() => {
    let isMounted = true;

    async function loadAccountName() {
      if (!supabase) return;

      try {
        const { data, error } = await supabase.auth.getUser();

        if (error) throw error;

        if (isMounted) {
          const fullName = data.user?.user_metadata?.full_name?.trim();

          if (fullName) {
            localStorage.setItem("trajectoryName", fullName);
            setFirstName(fullName);
          }
        }
      } catch (error) {
        console.error("Could not load account name:", error);
      }
    }

    loadAccountName();

    // Refresh dashboard data when saved information changes.
    const refresh = () => {
      setProfile(getDashboardProfile());
      setMissions(readStorage("trajectoryMissions", []));
      setProgress(readStorage("trajectoryMissionProgress", {}));

      setRewards(readStorage("trajectoryRewards", {
        totalXP: 0,
        unlockedAchievements: []
      }));

      setFirstName(localStorage.getItem("trajectoryName") || "");
    };

    const events = [
      "trajectoryMissionsUpdated",
      "trajectoryProgressUpdated",
      "trajectoryRewardsUpdated",
      "trajectoryProfileUpdated",
      "trajectoryNameUpdated",
      "storage"
    ];

    events.forEach((event) => {
      window.addEventListener(event, refresh);
    });

    return () => {
      isMounted = false;

      events.forEach((event) => {
        window.removeEventListener(event, refresh);
      });
    };
  }, []);

  useEffect(() => {
    if (!showProductivityHighlight) return undefined;

    function handleHighlightKeyDown(event) {
      if (event.key === "Escape") {
        localStorage.removeItem("trajectoryProfileHighlightPending");
        setShowProductivityHighlight(false);
      }
    }

    window.addEventListener("keydown", handleHighlightKeyDown);
    return () =>
      window.removeEventListener("keydown", handleHighlightKeyDown);
  }, [showProductivityHighlight]);

  const totalMissions = missions.length;

  const completedMissions = missions.filter(
    (mission) => progress[mission.id]?.completed === true
  ).length;

  const totalSteps = missions.reduce(
    (total, mission) => total + (mission.steps?.length || 0),
    0
  );

  const completedSteps = missions.reduce((total, mission) => {
    return total + (progress[mission.id]?.completedSteps?.length || 0);
  }, 0);

  const totalXP = rewards.totalXP || 0;
  const levelInfo = getLevelInfo(totalXP);
  const achievementCount = rewards.unlockedAchievements?.length || 0;

  const now = new Date();

  const greeting = now.getHours() < 12
    ? "Good morning"
    : now.getHours() < 18
      ? "Good afternoon"
      : "Good evening";

  const date = now.toLocaleDateString("en-ZA", {
    weekday: "long",
    day: "numeric",
    month: "long"
  });

  const displayName = firstName?.trim() || "user";

  const profileItems = [
    {
      icon: <FiTarget />,
      label: "Main challenge",
      value: profile?.mainChallenge || "Not yet identified"
    },
    {
      icon: <FiZap />,
      label: "Preferred approach",
      value: profile?.preferredApproach || "Not yet identified"
    },
    {
      icon: <FiClock />,
      label: "Working style",
      value: profile?.workStyle || "Not yet identified"
    },
    {
      icon: <FiHeart />,
      label: "Motivation",
      value: profile?.motivationStyle || "Not yet identified"
    }
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

  function dismissProductivityHighlight() {
    localStorage.removeItem("trajectoryProfileHighlightPending");
    setShowProductivityHighlight(false);
  }

  function getRoutineExplanation() {
    const challengeAdvice = {
      "I don't know where to start":
        "We'll help make the first step clear and small.",
      "I get distracted easily":
        "A short, focused timer can give one task a clear boundary.",
      "Everything feels overwhelming":
        "We'll break your mission into manageable steps instead of asking you to do it all at once.",
      "I struggle to stay motivated":
        "Visible progress and gentle encouragement can help you keep momentum.",
    };

    const approachAdvice = {
      "Breaking it into tiny steps":
        "Your missions are organised into smaller actions.",
      "Having a clear deadline":
        "A focus session gives one part of your task a defined time window.",
      "Someone keeping me accountable":
        "Checking off each step helps make your progress visible.",
      "Getting started before I overthink it":
        "You can focus on the next action rather than planning the whole mission.",
    };

    const workStyle = profile?.workStyle || "";
    const sessionAdvice = workStyle.includes("Short bursts")
      ? "Your short-burst preference informed the 15-minute starting session."
      : workStyle.includes("Long focused")
        ? "Your preference for longer focus informed the 40-minute starting session."
        : "We suggest a 25-minute starting session; you can adjust it to fit the day.";

    return [
      challengeAdvice[profile?.mainChallenge] ||
        "Your answers help keep your plan focused on a manageable next action.",
      approachAdvice[profile?.preferredApproach] || "",
      sessionAdvice,
    ].filter(Boolean).join(" ");
  }

  return (
    <main className="dashboard-page">

      {showProductivityHighlight && profile && (
        <div className="profile-highlight-backdrop">
          <section
            className="profile-highlight"
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-highlight-title"
            aria-describedby="profile-highlight-description"
          >
            <button
              className="profile-highlight-close"
              onClick={dismissProductivityHighlight}
              aria-label="Close productivity profile highlight"
            >
              <FiX />
            </button>

            <div className="profile-highlight-icon"><FiZap /></div>
            <span className="card-label">YOUR PROFILE HIGHLIGHT</span>
            <h2 id="profile-highlight-title">A routine shaped around you.</h2>
            <p id="profile-highlight-description" className="profile-highlight-intro">
              Your onboarding answers help Trajectory suggest a starting point.
              It’s a flexible guide, not a rulebook.
            </p>

            <div className="profile-highlight-facts">
              <div>
                <span>Your main challenge</span>
                <strong>{profile.mainChallenge || "Finding a comfortable starting point"}</strong>
              </div>
              <div>
                <span>What helps you most</span>
                <strong>{profile.preferredApproach || "A flexible approach"}</strong>
              </div>
              <div>
                <span>Your working style</span>
                <strong>{profile.workStyle || "Whatever feels right that day"}</strong>
              </div>
              <div>
                <span>Motivation that fits you</span>
                <strong>{profile.motivationStyle || "Gentle encouragement"}</strong>
              </div>
            </div>

            <div className="profile-highlight-routine">
              <span className="card-label">YOUR RECOMMENDED ROUTINE</span>
              <strong>{profile.recommendedSessionLength || "25 minutes"} to focus</strong>
              <span className="profile-highlight-planning">
                Planning approach:{" "}
                <b>
                  {profile.planningStyle?.replaceAll("-", " ") || "balanced"}
                </b>
              </span>
              <p>{getRoutineExplanation()}</p>
            </div>

            <div className="profile-highlight-actions">
              <button
                className="profile-highlight-done"
                onClick={dismissProductivityHighlight}
              >
                Got it
              </button>
              <button
                className="profile-highlight-timer"
                onClick={() => {
                  dismissProductivityHighlight();
                  navigate(missions.length === 0 ? "/missions/new" : "/timer");
                }}
              >
                {missions.length === 0
                  ? "Create your first mission"
                  : "Try a focus session"}{" "}
                <FiArrowRight />
              </button>
            </div>
          </section>
        </div>
      )}

      {showMissionPrompt && (
        <div className="mission-prompt-backdrop">
          <div className="mission-prompt">
            <button
              className="prompt-close"
              onClick={dismissMissionPrompt}
              aria-label="Close"
            >
              <FiX />
            </button>

            <div className="prompt-star">✦</div>
            <span className="card-label">YOUR JOURNEY STARTS HERE</span>

            <h2>Ready for your first mission?</h2>

            <p>
              Choose something you've been meaning to do. We'll help you
              turn it into smaller, more manageable steps.
            </p>

            <button
              className="add-task-button prompt-primary"
              onClick={() => navigate("/missions/new")}
            >
              <FiPlus /> Create my first mission
            </button>

            <button
              className="prompt-dismiss"
              onClick={dismissMissionPrompt}
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
            <FiHome /><span>Today</span>
          </Link>

          <Link to="/missions" className="nav-item">
            <FiTarget /><span>Missions</span>
          </Link>

          <Link to="/calendar" className="nav-item">
            <FiCalendar /><span>Calendar</span>
          </Link>

          <Link to="/timer" className="nav-item">
            <FiClock /><span>Focus timer</span>
          </Link>

          <Link to="/rewards" className="nav-item">
            <FiAward /><span>Rewards</span>
          </Link>

          <a href="#progress" className="nav-item">
            <FiBarChart2 /><span>Progress</span>
          </a>

          <Link to="/assistant" className="nav-item">
            <FiZap /><span>AI companion</span>
          </Link>

          <Link to="/profile" className="nav-item">
            <FiSettings /><span>My profile</span>
          </Link>
        </nav>

        <div className="sidebar-bottom">
          <Link to="/profile" className="profile-mini">
            <div className="profile-avatar">
              {displayName.charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{displayName}</strong>
              <span>Your trajectory</span>
            </div>
          </Link>

        </div>
      </aside>

      <section className="dashboard-main">

        <header className="dashboard-header">
          <div>
            <p className="dashboard-eyebrow">{date}</p>

            <h1>
              <span className="dashboard-greeting">{greeting},</span>{" "}
              <span className="rainbow-name">{displayName}.</span>
            </h1>

            <p>Let's make today feel a little less overwhelming.</p>
          </div>

          <button
            className="add-task-button"
            onClick={() => navigate("/missions/new")}
          >
            <FiPlus /> New mission
          </button>
        </header>

        <section className="momentum-card">
          <div className="momentum-copy">
            <span className="card-label">YOUR TRAJECTORY</span>
            <h2>Progress at <span>your pace.</span></h2>
            <p>You don't need to do everything at once.</p>

            <Link to="/missions" className="text-link">
              Explore your missions <FiArrowRight />
            </Link>
          </div>

          <div className="momentum-circle">
            <strong>{completedMissions} / {totalMissions}</strong>
            <span>missions complete</span>
          </div>
        </section>

        <div className="dashboard-grid">

          <section className="today-card">
            <div className="section-heading">
              <div>
                <span className="card-label">YOUR PRODUCTIVITY PROFILE</span>
                <h2>How you work best.</h2>
              </div>

              <div className="profile-header-actions">
                {profile && (
                  <button
                    className="profile-insight-link"
                    onClick={() => setShowProductivityHighlight(true)}
                  >
                    <FiZap /> Your profile insight
                  </button>
                )}
                <Link to="/profile" className="profile-edit-link">
                  Edit profile <FiArrowRight />
                </Link>
              </div>
            </div>

            {profile ? (
              <div className="task-list">
                {profileItems.map((item) => (
                  <div className="task profile-task" key={item.label}>
                    <div className="profile-task-icon">{item.icon}</div>

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
                  Complete your onboarding questionnaire so Trajectory
                  can personalise your experience.
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
              <span className="card-label">YOUR RECOMMENDED ROUTINE</span>

              <h3 className="routine-time">
                {profile?.recommendedSessionLength || "25 minutes"}
              </h3>

              <p className="routine-description">Suggested focus session</p>

              <Link to="/timer" className="text-link">
                <FiClock /> Start a focus session <FiArrowRight />
              </Link>

              {profile && (
                <button
                  className="routine-insight-link"
                  onClick={() => setShowProductivityHighlight(true)}
                >
                  <FiZap /> Why this routine?
                </button>
              )}

              <div className="routine-divider" />

              <span className="card-label">PLANNING APPROACH</span>

              <p className="routine-value">
                {profile?.planningStyle?.replaceAll("-", " ") || "Balanced"}
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
                <div className="dashboard-progress-track">
                  <div
                    className="dashboard-progress-fill"
                    style={{
                      width: `${totalSteps > 0
                        ? completedSteps / totalSteps * 100
                        : 0}%`
                    }}
                  />
                </div>
              )}

              <Link to="/missions" className="text-link">
                {totalMissions === 0 ? "Create a mission" : "View your missions"}
                {" "}<FiArrowRight />
              </Link>
            </section>

            <section className="weekly-card rewards-preview">
              <div className="rewards-preview-heading">
                <span className="card-label">YOUR REWARDS</span>
                <FiAward />
              </div>

              <div className="rewards-level">
                <div className="rewards-star"><FiStar /></div>

                <div>
                  <span>CURRENT LEVEL</span>
                  <strong>Level {levelInfo.level}</strong>
                </div>
              </div>

              <div className="rewards-xp-row">
                <strong>{totalXP.toLocaleString()} XP</strong>

                <span>
                  {levelInfo.nextLevelXP !== null
                    ? `${levelInfo.remainingXP} XP to next level`
                    : "Maximum level reached!"}
                </span>
              </div>

              <div className="dashboard-progress-track xp-track">
                <div
                  className="dashboard-progress-fill xp-fill"
                  style={{ width: `${levelInfo.progress}%` }}
                />
              </div>

              <p className="routine-description">
                {achievementCount} achievement{achievementCount === 1 ? "" : "s"} unlocked
              </p>

              <Link to="/rewards" className="text-link">
                View your rewards <FiArrowRight />
              </Link>
            </section>

          </div>
        </div>

        <section className="trajectory-message">
          <div className="message-symbol">✦</div>

          <div>
            <span className="card-label">A NOTE FROM TRAJECTORY</span>
            <p>
              {profile?.encouragement ||
                "You don't have to finish everything today. Starting is enough."}
            </p>
          </div>
        </section>

        <section className="star-companion" aria-label="Trajectory star companion">
          <img className="companion-mascot" src={trajectoryMascot} alt="Trajectory mascot" />

          <div>
            <span className="card-label">A LITTLE REMINDER</span>
            <p>{mascotMessage}</p>
          </div>
        </section>

      </section>
    </main>
  );
}

export default Dashboard;

