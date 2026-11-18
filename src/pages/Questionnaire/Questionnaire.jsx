
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import "./Questionnaire.css";

const questions = [
  {
    question: "What usually gets in the way of getting things done?",
    options: [
      "I don't know where to start",
      "I get distracted easily",
      "Everything feels overwhelming",
      "I struggle to stay motivated",
    ],
  },
  {
    question: "When you have a big task, what helps most?",
    options: [
      "Breaking it into tiny steps",
      "Having a clear deadline",
      "Someone keeping me accountable",
      "Getting started before I overthink it",
    ],
  },
  {
    question: "How do you usually work best?",
    options: [
      "Short bursts with breaks",
      "Long focused sessions",
      "Whatever feels right that day",
      "With someone else around",
    ],
  },
  {
    question: "What kind of motivation actually works on you?",
    options: [
      "Encouragement",
      "A little pressure",
      "Seeing my progress",
      "Rewards",
    ],
  },
  {
    question: "What does your task list usually feel like?",
    options: [
      "A helpful plan",
      "A giant wall of doom",
      "Something I constantly forget about",
      "I don't really use one",
    ],
  },
  {
    question: "What do you want Trajectory to help you do?",
    options: [
      "Start tasks instead of avoiding them",
      "Stay consistent",
      "Manage my time better",
      "Actually finish what I start",
    ],
  },
];

function Questionnaire() {
  const navigate = useNavigate();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [saving, setSaving] = useState(false);

  const question = questions[currentQuestion];
  const selectedAnswer = answers[currentQuestion];

  function handleAnswer(answer) {
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestion] = answer;
    setAnswers(updatedAnswers);
  }

  async function handleNext() {
    if (!selectedAnswer || saving) return;

    if (currentQuestion === questions.length - 1) {
      setSaving(true);

      const onboardingData = {
        answers: questions.map((item, index) => ({
          question: item.question,
          answer: answers[index],
        })),
        completed: true,
        completedAt: new Date().toISOString(),
      };

      localStorage.setItem(
        "trajectoryOnboarding",
        JSON.stringify(onboardingData)
      );
      localStorage.setItem("trajectoryProfileHighlightPending", "true");

      try {
        if (supabase) {
          const { data } = await supabase.auth.getUser();
          const userId = data?.user?.id;

          if (userId) {
            localStorage.setItem(
              `trajectoryOnboardingCompleted:${userId}`,
              "true"
            );

            const { error } = await supabase.auth.updateUser({
              data: {
                trajectory_onboarding_completed: true,
              },
            });

            if (error) {
              console.error(
                "Could not sync onboarding completion:",
                error.message
              );
            }
          }
        }
      } catch (error) {
        console.error("Onboarding completion could not be synced:", error);
      }

      navigate("/loading");
      return;
    }

    setCurrentQuestion((previous) => previous + 1);
  }

  function handleBack() {
    if (currentQuestion === 0) {
      navigate("/");
      return;
    }

    setCurrentQuestion((previous) => previous - 1);
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <main className="questionnaire-page">
      <nav className="questionnaire-nav">
        <Link to="/" className="logo">
          trajectory.
        </Link>

        <span className="questionnaire-counter">
          {currentQuestion + 1} <span>/</span> {questions.length}
        </span>
      </nav>

      <div
        className="progress-track"
        role="progressbar"
        aria-valuenow={currentQuestion + 1}
        aria-valuemin={1}
        aria-valuemax={questions.length}
        aria-label="Questionnaire progress"
      >
        <div
          className="progress-bar"
          style={{ width: `${progress}%` }}
        />
      </div>

      <section className="questionnaire-content">
        <div className="questionnaire-intro">
          <span className="questionnaire-kicker">
            LET'S MAKE THIS YOURS
          </span>
          <p>
            A little about you, so we can make Trajectory work with you.
          </p>
        </div>

        <div className="question-number">
          QUESTION 0{currentQuestion + 1}
        </div>

        <h1>{question.question}</h1>

        <p className="question-helper">
          There’s no right answer. Pick what feels most like you.
        </p>

        <div className="answer-list">
          {question.options.map((option, index) => (
            <button
              key={option}
              type="button"
              className={`answer-option ${
                selectedAnswer === option ? "selected" : ""
              }`}
              onClick={() => handleAnswer(option)}
              aria-pressed={selectedAnswer === option}
            >
              <span className="answer-number">
                {String.fromCharCode(65 + index)}
              </span>

              <span className="answer-text">{option}</span>

              <span className="answer-arrow">
                {selectedAnswer === option ? "✓" : "→"}
              </span>
            </button>
          ))}
        </div>

        <div className="question-actions">
          <button
            type="button"
            className="back-button"
            onClick={handleBack}
            disabled={saving}
          >
            ← Back
          </button>

          <button
            type="button"
            className={`continue-button ${
              selectedAnswer ? "active" : ""
            }`}
            onClick={handleNext}
            disabled={!selectedAnswer || saving}
          >
            {saving
              ? "Saving..."
              : currentQuestion === questions.length - 1
                ? "Build my trajectory →"
                : "Continue →"}
          </button>
        </div>

        <p className="questionnaire-reassurance">
          Take your time. You can always grow and adjust your system later.
        </p>
      </section>
    </main>
  );
}

export default Questionnaire;
