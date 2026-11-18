
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiSave,
  FiUser,
  FiEdit3,
  FiSparkles,
} from "react-icons/fi";
import "./Profile.css";

const ONBOARDING_KEY = "trajectoryOnboarding";

function readOnboarding() {
  try {
    return JSON.parse(localStorage.getItem(ONBOARDING_KEY) || "null") || {
      answers: [],
      completed: false,
    };
  } catch {
    return { answers: [], completed: false };
  }
}

function Profile() {
  const navigate = useNavigate();
  const [name, setName] = useState(
    localStorage.getItem("trajectoryName") || ""
  );
  const [onboarding, setOnboarding] = useState(readOnboarding);
  const [saved, setSaved] = useState(false);

  function updateAnswer(index, value) {
    setOnboarding((current) => ({
      ...current,
      answers: current.answers.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, answer: value }
          : item
      ),
    }));
    setSaved(false);
  }

  function saveProfile(event) {
    event.preventDefault();

    const cleanName = name.trim();

    if (cleanName) {
      localStorage.setItem("trajectoryName", cleanName);
      setName(cleanName);
    }

    localStorage.setItem(ONBOARDING_KEY, JSON.stringify(onboarding));

    window.dispatchEvent(new Event("trajectoryProfileUpdated"));
    window.dispatchEvent(new Event("trajectoryNameUpdated"));

    setSaved(true);
  }

  return (
    <main className="profile-page">
      <header className="profile-page-header">
        <Link to="/dashboard" className="profile-back">
          <FiArrowLeft />
          <span>Dashboard</span>
        </Link>

        <Link to="/" className="profile-logo">
          trajectory.
        </Link>
      </header>

      <section className="profile-page-content">
        <div className="profile-heading">
          <span className="profile-eyebrow">YOUR SPACE</span>
          <h1>Your profile.</h1>
          <p className="profile-intro">
            Your preferences help Trajectory shape a working style that
            feels more manageable for you. You can update these whenever
            you need to.
          </p>
        </div>

        <form className="profile-form" onSubmit={saveProfile}>
          <div className="profile-section-heading">
            <span className="profile-icon">
              <FiUser />
            </span>
            <div>
              <h2>Personal details</h2>
              <p>The name we'll use to greet you.</p>
            </div>
          </div>

          <div className="profile-field">
            <label htmlFor="profile-name">Your name</label>
            <input
              id="profile-name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setSaved(false);
              }}
              placeholder="What should we call you?"
              autoComplete="name"
            />
          </div>

          <div className="profile-section-heading profile-preferences-heading">
            <span className="profile-icon">
              <FiEdit3 />
            </span>
            <div>
              <h2>Your productivity profile</h2>
              <p>Your original onboarding answers, ready to edit.</p>
            </div>
          </div>

          {onboarding.answers?.length > 0 ? (
            <div className="profile-answers">
              {onboarding.answers.map((item, index) => (
                <div
                  className="profile-field"
                  key={`${item.question}-${index}`}
                >
                  <label htmlFor={`profile-answer-${index}`}>
                    {item.question}
                  </label>
                  <input
                    id={`profile-answer-${index}`}
                    value={item.answer || ""}
                    onChange={(event) =>
                      updateAnswer(index, event.target.value)
                    }
                    placeholder="Your answer"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="profile-empty-state">
              <span className="profile-empty-icon">
                <FiSparkles />
              </span>
              <h3>Your profile is waiting to take shape.</h3>
              <p>
                Complete your productivity questionnaire to help
                personalise your Trajectory experience.
              </p>
              <button
                type="button"
                className="profile-questionnaire-link"
                onClick={() => navigate("/questionnaire")}
              >
                Complete questionnaire
                <span>→</span>
              </button>
            </div>
          )}

          <div className="profile-save-row">
            <button className="profile-save-button" type="submit">
              <FiSave />
              Save changes
            </button>

            {saved && (
              <span className="profile-saved-message" role="status">
                Changes saved ✓
              </span>
            )}
          </div>
        </form>

        {onboarding.answers?.length > 0 && (
          <button
            type="button"
            className="profile-retake-link"
            onClick={() => navigate("/questionnaire")}
          >
            Retake onboarding questionnaire →
          </button>
        )}
      </section>
    </main>
  );
}

export default Profile;
