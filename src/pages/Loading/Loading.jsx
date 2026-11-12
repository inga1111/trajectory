
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Loading.css";

function createProductivityProfile(onboardingData) {
  const answers = onboardingData?.answers || [];

  const getAnswer = (index) =>
    answers[index]?.answer || "";

  const profile = {
    mainChallenge: getAnswer(0),
    preferredApproach: getAnswer(1),
    workStyle: getAnswer(2),
    motivationStyle: getAnswer(3),
    taskListExperience: getAnswer(4),
    primaryGoal: getAnswer(5),
  };

  let planningStyle = "balanced";
  let sessionLength = "25 minutes";
  let encouragement = "Small steps still count.";

  if (
    profile.mainChallenge.includes("start") ||
    profile.mainChallenge.includes("overwhelming")
  ) {
    planningStyle = "small-steps";
  }

  if (
    profile.preferredApproach.includes("tiny steps") ||
    profile.preferredApproach.includes("overthink")
  ) {
    planningStyle = "step-by-step";
  }

  if (profile.workStyle.includes("Short bursts")) {
    sessionLength = "15 minutes";
  } else if (profile.workStyle.includes("Long focused")) {
    sessionLength = "40 minutes";
  }

  if (profile.motivationStyle.includes("Encouragement")) {
    encouragement = "You're doing better than you think. Keep going.";
  } else if (profile.motivationStyle.includes("pressure")) {
    encouragement = "Let's tackle one priority at a time.";
  } else if (profile.motivationStyle.includes("progress")) {
    encouragement = "Every completed step moves you forward.";
  } else if (profile.motivationStyle.includes("Rewards")) {
    encouragement = "Every mission brings you closer to your next reward.";
  }

  return {
    ...profile,
    planningStyle,
    recommendedSessionLength: sessionLength,
    encouragement,
    createdAt: new Date().toISOString(),
  };
}

function Loading() {
  const navigate = useNavigate();

  useEffect(() => {
    const onboardingData = JSON.parse(
      localStorage.getItem("trajectoryOnboarding") || "null"
    );

    if (!onboardingData?.completed) {
      navigate("/questionnaire", { replace: true });
      return;
    }

    const profile = createProductivityProfile(onboardingData);

    localStorage.setItem(
      "trajectoryProfile",
      JSON.stringify(profile)
    );

    const timer = setTimeout(() => {
      navigate("/dashboard");
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <main className="loading-page">
      <div className="loading-content">
        <div className="loading-orbit">
          <div className="loading-dot"></div>
        </div>

        <p className="loading-eyebrow">
          TRAJECTORY
        </p>

        <h1>
          Building your
          <span> trajectory.</span>
        </h1>

        <p className="loading-message">
          We're learning how you work best and
          creating a productivity experience
          that works with your brain, not against it.
        </p>

        <div className="loading-status">
          <span className="status-dot"></span>
          Creating your productivity profile...
        </div>
      </div>
    </main>
  );
}

export default Loading;
