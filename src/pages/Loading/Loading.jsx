
import { useEffect, useState } from "react";
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
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onboardingData = JSON.parse(
      localStorage.getItem("trajectoryOnboarding") || "null"
    );

    const existingProfile = JSON.parse(
      localStorage.getItem("trajectoryProfile") || "null"
    );

    if (!onboardingData?.completed && !existingProfile) {
      navigate("/questionnaire", { replace: true });
      return;
    }

    if (onboardingData?.completed) {
      const profile = createProductivityProfile(onboardingData);

      localStorage.setItem(
        "trajectoryProfile",
        JSON.stringify(profile)
      );
    }

    const duration = 6000;
    const interval = 60;
    const totalSteps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep += 1;

      const nextProgress = Math.min(
        Math.round((currentStep / totalSteps) * 100),
        100
      );

      setProgress(nextProgress);

      if (nextProgress >= 100) {
        clearInterval(timer);

        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 500);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <main className="loading-page">
      <div className="loading-content">
        <h1 className="loading-wordmark" aria-label="trajectory.">
          <span>t</span>
          <span>r</span>
          <span>a</span>
          <span>j</span>
          <span>e</span>
          <span>c</span>
          <span>t</span>
          <span>o</span>
          <span>r</span>
          <span>y</span>
          <span className="loading-period">.</span>
        </h1>

        <p className="loading-message">
          Putting the pieces together and creating a space
          that works with your brain, not against it.
        </p>

        <div className="loading-progress-heading">
          <span>Building your trajectory</span>
          <strong>{progress}%</strong>
        </div>

        <div
          className="loading-progress-track"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label="Building your trajectory"
        >
          <div
            className="loading-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="loading-status">
          {progress < 25
            ? "Getting to know how you work..."
            : progress < 55
            ? "Personalising your experience..."
            : progress < 85
            ? "Putting your productivity profile together..."
            : progress < 100
            ? "Getting everything ready..."
            : "You're all set."}
        </p>
      </div>
    </main>
  );
}

export default Loading;
