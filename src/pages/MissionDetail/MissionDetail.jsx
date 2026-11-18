import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiGift,
  FiTarget,
  FiZap,
} from "react-icons/fi";
import "./MissionDetail.css";

const MISSIONS_KEY = "trajectoryMissions";
const PROGRESS_KEY = "trajectoryMissionProgress";
const REWARDS_KEY = "trajectoryRewards";

const STEP_XP = 10;
const MISSION_XP = 30;

const ACHIEVEMENTS = [
  {
    id: "first-mission",
    title: "First Mission",
    description: "Complete your first mission.",
    icon: "🏆",
  },
  {
    id: "five-missions",
    title: "Getting Somewhere",
    description: "Complete 5 missions.",
    icon: "🌟",
  },
  {
    id: "ten-missions",
    title: "Momentum",
    description: "Complete 10 missions.",
    icon: "⚡",
  },
  {
    id: "twenty-five-steps",
    title: "Step by Step",
    description: "Complete 25 mission steps.",
    icon: "💜",
  },
];

const CONFETTI = Array.from({ length: 36 }, (_, index) => ({
  id: index,
  left: `${(index * 37) % 100}%`,
  delay: `${(index % 9) * 0.12}s`,
  duration: `${2.2 + (index % 5) * 0.35}s`,
  rotation: `${index * 47}deg`,
  color: ["#9b7bea", "#f3c969", "#f28eae", "#77c9bb", "#b8a4f5"][index % 5],
}));

function getLevelInfo(xp) {
  const thresholds = [0, 100, 250, 450, 700, 1000, 1400, 1850, 2350, 3000];

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

function MissionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [mission, setMission] = useState(null);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rewards, setRewards] = useState(readRewards);
  const [earnedXP, setEarnedXP] = useState(0);
  const [newAchievements, setNewAchievements] = useState([]);
  const [stepCelebration, setStepCelebration] = useState(null);

  useEffect(() => {
    try {
      const savedMissions = JSON.parse(
        localStorage.getItem(MISSIONS_KEY) || "[]"
      );

      const savedProgress = JSON.parse(
        localStorage.getItem(PROGRESS_KEY) || "{}"
      );

      const selectedMission = savedMissions.find(
        (item) => String(item.id) === String(id)
      );

      if (!selectedMission) {
        setMission(null);
        setLoading(false);
        return;
      }

      const progress = savedProgress[selectedMission.id] || {};

      // Opening a mission moves it into the "In progress" group.
      if (!progress.completed && !progress.started) {
        savedProgress[selectedMission.id] = {
          ...progress,
          started: true,
          startedAt: new Date().toISOString(),
        };

        localStorage.setItem(PROGRESS_KEY, JSON.stringify(savedProgress));
        window.dispatchEvent(new Event("trajectoryProgressUpdated"));
      }

      setMission(selectedMission);
      setCompletedSteps(progress.completedSteps || []);
      setIsComplete(progress.completed === true);
    } catch (error) {
      console.error("Could not load mission:", error);
      setMission(null);
    }

    setLoading(false);
  }, [id]);

  const steps = useMemo(() => mission?.steps || [], [mission]);

  const levelInfo = getLevelInfo(rewards.totalXP || 0);

  const percentage =
    steps.length > 0
      ? Math.round((completedSteps.length / steps.length) * 100)
      : 0;

  function saveProgress(nextCompletedSteps, completed) {
    if (!mission) return;

    try {
      const allProgress = JSON.parse(
        localStorage.getItem(PROGRESS_KEY) || "{}"
      );

      const previousProgress = allProgress[mission.id] || {};

      allProgress[mission.id] = {
        ...previousProgress,
        completedSteps: nextCompletedSteps,
        completed,
        completedAt: completed ? new Date().toISOString() : null,
      };

      localStorage.setItem(PROGRESS_KEY, JSON.stringify(allProgress));

      window.dispatchEvent(new Event("trajectoryProgressUpdated"));
    } catch (error) {
      console.error("Could not save mission progress:", error);
    }
  }

  function awardRewards(nextCompletedSteps) {
    const allProgress = JSON.parse(
      localStorage.getItem(PROGRESS_KEY) || "{}"
    );

    const previousProgress = allProgress[mission.id] || {};

    const awardedStepIndices = previousProgress.awardedStepIndices || [];

    const newlyAwardedSteps = nextCompletedSteps.filter(
      (stepIndex) => !awardedStepIndices.includes(stepIndex)
    );

    const completedStepXP = newlyAwardedSteps.length * STEP_XP;

    const missionBonusAlreadyAwarded =
      previousProgress.missionBonusAwarded === true;

    const isNowComplete =
      steps.length > 0 &&
      nextCompletedSteps.length === steps.length;

    const missionBonus =
      isNowComplete && !missionBonusAlreadyAwarded ? MISSION_XP : 0;

    const totalEarned = completedStepXP + missionBonus;

    const updatedProgress = {
      ...previousProgress,
      awardedStepIndices: [
        ...awardedStepIndices,
        ...newlyAwardedSteps,
      ],
      missionBonusAwarded:
        missionBonusAlreadyAwarded || missionBonus > 0,
      xpAwarded: (previousProgress.xpAwarded || 0) + missionBonus,
    };

    allProgress[mission.id] = updatedProgress;

    localStorage.setItem(PROGRESS_KEY, JSON.stringify(allProgress));

    const previousRewards = readRewards();

    const completedMissionCount = Object.values(allProgress).filter(
      (item) => item.completed === true
    ).length;

    const completedStepCount = Object.values(allProgress).reduce(
      (total, item) => total + (item.completedSteps?.length || 0),
      0
    );

    const unlocked = new Set(
      previousRewards.unlockedAchievements || []
    );

    const newlyUnlocked = [];

    const unlock = (achievementId) => {
      if (!unlocked.has(achievementId)) {
        unlocked.add(achievementId);

        const achievement = ACHIEVEMENTS.find(
          (item) => item.id === achievementId
        );

        if (achievement) newlyUnlocked.push(achievement);
      }
    };

    if (completedMissionCount >= 1) unlock("first-mission");
    if (completedMissionCount >= 5) unlock("five-missions");
    if (completedMissionCount >= 10) unlock("ten-missions");
    if (completedStepCount >= 25) unlock("twenty-five-steps");

    const updatedRewards = {
      totalXP: (previousRewards.totalXP || 0) + totalEarned,
      unlockedAchievements: [...unlocked],
    };

    localStorage.setItem(REWARDS_KEY, JSON.stringify(updatedRewards));

    setRewards(updatedRewards);
    setEarnedXP(totalEarned);
    setNewAchievements(newlyUnlocked);

    window.dispatchEvent(new Event("trajectoryRewardsUpdated"));
  }

  function toggleStep(index) {
    if (isComplete) return;

    const nextCompletedSteps = completedSteps.includes(index)
      ? completedSteps.filter((step) => step !== index)
      : [...completedSteps, index];

    const nextIsComplete =
      steps.length > 0 &&
      nextCompletedSteps.length === steps.length;

    setCompletedSteps(nextCompletedSteps);
    setIsComplete(nextIsComplete);

    saveProgress(nextCompletedSteps, nextIsComplete);

    if (!completedSteps.includes(index)) {
      awardRewards(nextCompletedSteps);

      if (!nextIsComplete) {
        const celebrationId = `${index}-${Date.now()}`;

        setStepCelebration({
          index,
          id: celebrationId,
        });

        window.setTimeout(() => {
          setStepCelebration((current) =>
            current?.id === celebrationId ? null : current
          );
        }, 1350);
      }
    }
  }

  if (loading) {
    return (
      <main className="mission-detail-page">
        Loading mission...
      </main>
    );
  }

  if (!mission) {
    return (
      <main className="mission-detail-page">
        <div className="mission-not-found">
          <FiTarget />
          <h1>Mission not found</h1>
          <p>
            This mission may have been removed or is no longer available.
          </p>
          <Link to="/missions">Back to missions</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mission-detail-page">
      <style>{`
        @keyframes confettiFall {
          0% {
            transform: translate3d(0, -15vh, 0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate3d(35px, 110vh, 0) rotate(720deg);
            opacity: 0;
          }
        }

        @keyframes rewardPop {
          0% { transform: scale(0.4); opacity: 0; }
          65% { transform: scale(1.12); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes rewardFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-9px); }
        }

        @keyframes rewardGlow {
          0%, 100% { box-shadow: 0 0 0 rgba(155,123,234,0); }
          50% { box-shadow: 0 0 35px rgba(155,123,234,0.28); }
        }

        .trajectory-confetti {
          position: fixed;
          top: 0;
          width: 10px;
          height: 16px;
          border-radius: 3px;
          pointer-events: none;
          z-index: 1002;
          animation-name: confettiFall;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
        }

        .trajectory-reward-pop {
          animation: rewardPop 0.65s ease-out both;
        }

        .trajectory-reward-float {
          animation: rewardFloat 2.5s ease-in-out infinite;
        }

        .trajectory-xp-glow {
          animation: rewardGlow 2s ease-in-out infinite;
        }

        @keyframes stepRewardPop {
          0% {
            transform: translateY(12px) scale(0.65);
            opacity: 0;
          }
          22% {
            transform: translateY(-5px) scale(1.08);
            opacity: 1;
          }
          70% {
            transform: translateY(-20px) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(-34px) scale(0.96);
            opacity: 0;
          }
        }

        @keyframes stepSparkle {
          0% {
            transform: scale(0.3) rotate(0deg);
            opacity: 0;
          }
          25% {
            transform: scale(1.15) rotate(35deg);
            opacity: 1;
          }
          100% {
            transform: scale(0.7) rotate(95deg);
            opacity: 0;
          }
        }

        .mission-step-celebration {
          position: absolute;
          right: 22px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          align-items: center;
          gap: 7px;
          z-index: 3;
          pointer-events: none;
          animation: stepRewardPop 1.25s ease-out forwards;
          color: #7954c7;
          font-weight: 800;
          font-size: 1.05rem;
          white-space: nowrap;
          text-shadow: 0 2px 12px rgba(155,123,234,0.2);
        }

        .mission-step-celebration-sparkle {
          display: inline-block;
          color: #e5b94d;
          font-size: 1.2rem;
          animation: stepSparkle 0.85s ease-out both;
        }

        .mission-detail-step.step-celebrating {
          position: relative;
          overflow: visible;
          animation: rewardGlow 1.1s ease-in-out;
          border-color: #b49ae9;
        }

        .mission-step-checkbox.step-just-completed {
          animation: rewardPop 0.55s ease-out;
        }
      `}</style>

      <div className="mission-detail-container">
        <button
          className="mission-detail-back"
          onClick={() => navigate("/missions")}
        >
          <FiArrowLeft />
          Back to missions
        </button>

        {isComplete ? (
          <section className="mission-completion">
            {CONFETTI.map((piece) => (
              <span
                className="trajectory-confetti"
                key={piece.id}
                style={{
                  left: piece.left,
                  backgroundColor: piece.color,
                  animationDelay: piece.delay,
                  animationDuration: piece.duration,
                  transform: `rotate(${piece.rotation})`,
                }}
              />
            ))}

            <div className="trajectory-reward-pop">
              <div className="mission-completion-icon trajectory-reward-float">
                <FiCheckCircle />
              </div>

              <span className="mission-detail-eyebrow">
                MISSION COMPLETE
              </span>

              <h1>You did it!</h1>

              <p>
                You showed up for yourself and followed through.
                Take a moment to enjoy that.
              </p>

              <div
                className="mission-reward-card trajectory-xp-glow"
                style={{ margin: "28px auto" }}
              >
                <span className="mission-reward-icon">
                  <FiGift />
                </span>

                <div>
                  <span>YOU EARNED</span>
                  <strong>+{earnedXP} XP</strong>
                  <small>
                    {earnedXP > MISSION_XP
                      ? `${STEP_XP} XP per step + ${MISSION_XP} mission bonus`
                      : earnedXP === MISSION_XP
                        ? "Mission completion bonus"
                        : "Step completion reward"}
                  </small>
                </div>
              </div>

              <div
                style={{
                  maxWidth: "360px",
                  margin: "0 auto 24px",
                  padding: "20px",
                  borderRadius: "18px",
                  background: "#f7f3ff",
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "12px",
                  }}
                >
                  <strong>
                    <FiZap style={{ verticalAlign: "middle" }} /> Level{" "}
                    {levelInfo.level}
                  </strong>
                  <span>{rewards.totalXP} total XP</span>
                </div>

                <div
                  style={{
                    height: "9px",
                    background: "#e6def6",
                    borderRadius: "20px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${levelInfo.progress}%`,
                      background: "#9876df",
                      borderRadius: "20px",
                      transition: "width 0.8s ease",
                    }}
                  />
                </div>

                <small style={{ display: "block", marginTop: "9px" }}>
                  {levelInfo.remaining > 0
                    ? `${levelInfo.remaining} XP until the next level`
                    : "Maximum level reached!"}
                </small>
              </div>

              {newAchievements.length > 0 && (
                <div
                  style={{
                    margin: "0 auto 24px",
                    maxWidth: "360px",
                  }}
                >
                  <span className="mission-detail-eyebrow">
                    NEW ACHIEVEMENT UNLOCKED
                  </span>

                  {newAchievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        padding: "16px",
                        marginTop: "12px",
                        borderRadius: "16px",
                        background: "#fff8e8",
                        textAlign: "left",
                      }}
                    >
                      <span style={{ fontSize: "30px" }}>
                        {achievement.icon}
                      </span>
                      <div>
                        <strong>{achievement.title}</strong>
                        <p style={{ margin: "4px 0 0" }}>
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                className="mission-continue-button"
                onClick={() => navigate("/missions")}
              >
                Continue to missions
              </button>
            </div>
          </section>
        ) : (
          <>
            <header className="mission-detail-header">
              <span className="mission-detail-eyebrow">
                {mission.category || "PERSONAL MISSION"}
              </span>

              <span className="mission-detail-icon">
                <FiTarget />
              </span>

              <h1>{mission.title}</h1>
              <p>{mission.description}</p>

              <span className="mission-detail-encouragement">
                {mission.encouragement ||
                  "One step at a time. You've got this."}
              </span>
            </header>

            <section className="mission-detail-progress">
              <div className="mission-detail-progress-heading">
                <div>
                  <span>YOUR PROGRESS</span>
                  <h2>{percentage}% complete</h2>
                </div>

                <strong>
                  {completedSteps.length}/{steps.length}
                </strong>
              </div>

              <div className="mission-detail-progress-track">
                <div
                  className="mission-detail-progress-fill"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </section>

            <section className="mission-detail-steps">
              <div className="mission-detail-steps-heading">
                <div>
                  <h2>Let's get it done.</h2>
                  <p>Work through each step at your own pace.</p>
                </div>

                <span>{steps.length} steps</span>
              </div>

              {steps.map((step, index) => {
                const checked = completedSteps.includes(index);

                return (
                  <article
                    className={`mission-detail-step ${
                      checked ? "step-completed" : ""
                    } ${
                      stepCelebration?.index === index
                        ? "step-celebrating"
                        : ""
                    }`}
                    key={`${mission.id}-${index}`}
                  >
                    <button
                      type="button"
                      className={`mission-step-checkbox ${
                        stepCelebration?.index === index
                          ? "step-just-completed"
                          : ""
                      }`}
                      onClick={() => toggleStep(index)}
                      aria-label={
                        checked
                          ? `Mark ${step.title} incomplete`
                          : `Complete ${step.title}`
                      }
                      aria-pressed={checked}
                    >
                      {checked && <FiCheck />}
                    </button>

                    <div className="mission-step-content">
                      <span>STEP {index + 1}</span>
                      <h3>{step.title}</h3>

                      {step.description && <p>{step.description}</p>}

                      {step.duration && (
                        <small>
                          <FiClock />
                          {step.duration}
                        </small>
                      )}
                    </div>

                    {checked && (
                      <span className="mission-step-done">
                        Done
                      </span>
                    )}

                    {stepCelebration?.index === index && (
                      <span
                        key={stepCelebration.id}
                        className="mission-step-celebration"
                        aria-live="polite"
                      >
                        <span className="mission-step-celebration-sparkle">
                          ✦
                        </span>
                        +{STEP_XP} XP!
                        <span className="mission-step-celebration-sparkle">
                          ✧
                        </span>
                      </span>
                    )}
                  </article>
                );
              })}
            </section>

            <div className="mission-detail-footer">
              <span>
                <FiGift />
                Earn {STEP_XP} XP per step + {MISSION_XP} bonus XP
              </span>

              <span>
                {steps.length - completedSteps.length} steps remaining
              </span>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default MissionDetail;