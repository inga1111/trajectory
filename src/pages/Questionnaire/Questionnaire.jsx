import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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

  const question = questions[currentQuestion];
  const selectedAnswer = answers[currentQuestion];

  function handleAnswer(answer) {
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestion] = answer;
    setAnswers(updatedAnswers);
  }

  function handleNext() {
    if (!selectedAnswer) return;

    if (currentQuestion === questions.length - 1) {
      navigate("/loading");
      return;
    }

    setCurrentQuestion(currentQuestion + 1);
  }

  function handleBack() {
    if (currentQuestion === 0) {
      navigate("/");
      return;
    }

    setCurrentQuestion(currentQuestion - 1);
  }

  const progress =
    ((currentQuestion + 1) / questions.length) * 100;

  return (
    <main className="questionnaire-page">

      <nav className="questionnaire-nav">
        <Link to="/" className="logo">
          trajectory.
        </Link>

        <span>
          {currentQuestion + 1} / {questions.length}
        </span>
      </nav>

      <div className="progress-track">
        <div
          className="progress-bar"
          style={{ width: `${progress}%` }}
        />
      </div>

      <section className="questionnaire-content">

        <div className="question-number">
          0{currentQuestion + 1}
        </div>

        <h1>{question.question}</h1>

        <p className="question-helper">
          There’s no right answer. Pick what feels most like you.
        </p>

        <div className="answer-list">
          {question.options.map((option, index) => (
            <button
              key={option}
              className={`answer-option ${
                selectedAnswer === option ? "selected" : ""
              }`}
              onClick={() => handleAnswer(option)}
            >
              <span className="answer-number">
                {String.fromCharCode(65 + index)}
              </span>

              <span>{option}</span>

              <span className="answer-arrow">→</span>
            </button>
          ))}
        </div>

        <div className="question-actions">

          <button
            className="back-button"
            onClick={handleBack}
          >
            ← Back
          </button>

          <button
            className={`continue-button ${
              selectedAnswer ? "active" : ""
            }`}
            onClick={handleNext}
          >
            {currentQuestion === questions.length - 1
              ? "Build my trajectory"
              : "Continue →"}
          </button>

        </div>

      </section>

    </main>
  );
}

export default Questionnaire;