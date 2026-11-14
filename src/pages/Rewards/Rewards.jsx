
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiAward,
  FiLock,
  FiZap,
  FiTarget,
  FiCheckCircle,
  FiStar,
} from "react-icons/fi";
import "./Rewards.css";

const REWARDS_KEY = "trajectoryRewards";

const ACHIEVEMENTS = [
  {
    id: "first-mission",
    title: "First Mission",
    description: "Complete your very first mission.",
    icon: "🏆",
    requirement: "Complete 1 mission",
    category: "Missions",
  },
  {
    id: "five-missions",
    title: "Getting Somewhere",
    description: "You're building momentum. Keep going!",
    icon: "🌟",
    requirement: "Complete 5 missions",
    category: "Missions",
  },
  {
    id: "ten-missions",
    title: "Momentum",
    description: "Ten missions down. You're on a roll!",
    icon: "⚡",
    requirement: "Complete 10 missions",
    category: "Missions",
  },
  {
    id: "twenty-five-steps",
    title: "Step by Step",
    description: "Every little step adds up to something big.",
    icon: "💜",
    requirement: "Complete 25 steps",
    category: "Progress",
  },
];

function getLevelInfo(xp) {
  const thresholds = [
    0, 100, 250, 450, 700, 1000, 1400, 1850, 2350, 3000,
  ];

  let level = 1;

  for (let index = 0; index < thresholds.length; index++) {
    if (xp >= thresholds[index]) {
      level = index + 1;
    }
  }

  const currentThreshold = thresholds[level - 1] || 0;
  const nextThreshold = thresholds[level] || currentThreshold + 1000;

  return {
    level,
    currentThreshold,
    nextThreshold,
    progress:
      nextThreshold > currentThreshold
        ? Math.min(
            100,
            ((xp - currentThreshold) /
              (nextThreshold - currentThreshold)) *
              100
          )
        : 100,
    remaining: Math.max(0, nextThreshold - xp),
  };
}

function readRewards() {
  try {
    return JSON.parse(
      localStorage.getItem(REWARDS_KEY) ||
        '{"totalXP":0,"unlockedAchievements":[]}'
    );
  } catch {
    return {
      totalXP: 0,
      unlockedAchievements: [],
    };
  }
}

function Rewards() {
  const [rewards, setRewards] = useState(readRewards);

  useEffect(() => {
    const updateRewards = () => {
      setRewards(readRewards());
    };

    window.addEventListener("trajectoryRewardsUpdated", updateRewards);
    window.addEventListener("storage", updateRewards);

    return () => {
      window.removeEventListener("trajectoryRewardsUpdated", updateRewards);
      window.removeEventListener("storage", updateRewards);
    };
  }, []);

  const totalXP = rewards.totalXP || 0;
  const unlockedAchievements = rewards.unlockedAchievements || [];
  const levelInfo = getLevelInfo(totalXP);

  const earnedCount = ACHIEVEMENTS.filter((achievement) =>
    unlockedAchievements.includes(achievement.id)
  ).length;

  return (
    <main className="rewards-page">
      <div className="rewards-container">
        <Link to="/dashboard" className="rewards-back">
          <FiArrowLeft />
          Back to dashboard
        </Link>

        <header className="rewards-header">
          <span className="rewards-eyebrow">YOUR ACHIEVEMENTS</span>
          <div className="rewards-header-icon">
            <FiAward />
          </div>
          <h1>Your rewards.</h1>
          <p>
            Every step counts. Every mission matters.
            Look how far you've come.
          </p>
        </header>

        <section className="rewards-level-card">
          <div className="rewards-level-top">
            <div>
              <span className="rewards-card-label">CURRENT LEVEL</span>
              <h2>Level {levelInfo.level}</h2>
              <p>Keep showing up. You're making progress.</p>
            </div>

            <div className="rewards-level-icon">
              <FiZap />
            </div>
          </div>

          <div className="rewards-xp-total">
            <strong>{totalXP.toLocaleString()}</strong>
            <span> TOTAL XP</span>
          </div>

          <div className="rewards-progress-track">
            <div
              className="rewards-progress-fill"
              style={{ width: `${levelInfo.progress}%` }}
            />
          </div>

          <div className="rewards-progress-labels">
            <span>Level {levelInfo.level}</span>
            <span>
              {levelInfo.remaining > 0
                ? `${levelInfo.remaining} XP to next level`
                : "Level milestone reached!"}
            </span>
          </div>
        </section>

        <section className="rewards-stats">
          <article className="rewards-stat-card">
            <span className="rewards-stat-icon purple">
              <FiAward />
            </span>
            <strong>{earnedCount}/{ACHIEVEMENTS.length}</strong>
            <span>Achievements earned</span>
          </article>

          <article className="rewards-stat-card">
            <span className="rewards-stat-icon gold">
              <FiStar />
            </span>
            <strong>{totalXP.toLocaleString()}</strong>
            <span>Total XP collected</span>
          </article>
        </section>

        <section className="rewards-collection">
          <div className="rewards-section-heading">
            <div>
              <span className="rewards-eyebrow">THE COLLECTION</span>
              <h2>Your achievements</h2>
              <p>Unlock badges as you make progress.</p>
            </div>

            <span className="rewards-collection-count">
              {earnedCount} UNLOCKED
            </span>
          </div>

          <div className="rewards-grid">
            {ACHIEVEMENTS.map((achievement) => {
              const unlocked = unlockedAchievements.includes(
                achievement.id
              );

              return (
                <article
                  className={`rewards-achievement-card ${
                    unlocked ? "achievement-unlocked" : "achievement-locked"
                  }`}
                  key={achievement.id}
                >
                  <div className="rewards-achievement-top">
                    <div className="rewards-achievement-icon">
                      {unlocked ? (
                        achievement.icon
                      ) : (
                        <FiLock />
                      )}
                    </div>

                    {unlocked ? (
                      <span className="achievement-status unlocked">
                        <FiCheckCircle />
                        Unlocked
                      </span>
                    ) : (
                      <span className="achievement-status locked">
                        <FiLock />
                        Locked
                      </span>
                    )}
                  </div>

                  <div className="rewards-achievement-info">
                    <span className="achievement-category">
                      {achievement.category}
                    </span>

                    <h3>{achievement.title}</h3>

                    <p>{achievement.description}</p>
                  </div>

                  <div className="rewards-achievement-requirement">
                    <FiTarget />
                    {achievement.requirement}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="rewards-encouragement">
          <span>💜</span>
          <div>
            <h3>Progress isn't always linear.</h3>
            <p>
              You don't have to do everything today.
              One completed step is still a win.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Rewards;
