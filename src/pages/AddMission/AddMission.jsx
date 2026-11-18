
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiPlus, FiTrash2, FiTarget } from "react-icons/fi";
import "./AddMission.css";

const STORAGE_KEY = "trajectoryMissions";

const starterSteps = [
  {
    title: "Get everything ready",
    description: "Gather what you need to begin.",
    duration: "5 min",
  },
  {
    title: "Work on the next small part",
    description: "Focus on one manageable part of your task.",
    duration: "15 min",
  },
  {
    title: "Review what you've done",
    description: "Check your progress and decide what's next.",
    duration: "5 min",
  },
];

function AddMission() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Personal");
  const [steps, setSteps] = useState(
    starterSteps.map((step) => ({ ...step }))
  );
  const [error, setError] = useState("");

  function updateStep(index, field, value) {
    setSteps((currentSteps) =>
      currentSteps.map((step, stepIndex) =>
        stepIndex === index
          ? { ...step, [field]: value }
          : step
      )
    );

    setError("");
  }

  function addStep() {
    setSteps((currentSteps) => [
      ...currentSteps,
      {
        title: "",
        description: "",
        duration: "5 min",
      },
    ]);
    setError("");
  }

  function removeStep(index) {
    setSteps((currentSteps) =>
      currentSteps.filter((_, stepIndex) => stepIndex !== index)
    );
    setError("");
  }

  function handleSave(event) {
    event.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Give your mission a name before saving.");
      return;
    }

    const validSteps = steps
      .filter((step) => step.title.trim().length > 0)
      .map((step) => ({
        title: step.title.trim(),
        description: step.description.trim(),
        duration: step.duration.trim() || "5 min",
      }));

    if (validSteps.length === 0) {
      setError("Add at least one named step to your mission.");
      return;
    }

    const mission = {
      id: `mission-${Date.now()}`,
      title: title.trim(),
      description:
        description.trim() ||
        "A personal mission, broken into manageable steps.",
      category,
      duration: `${validSteps.length} steps`,
      difficulty: "Your own pace",
      encouragement: "You've got this. One step at a time.",
      steps: validSteps,
      createdAt: new Date().toISOString(),
    };

    try {
      const storedMissions = localStorage.getItem(STORAGE_KEY);
      const existingMissions = storedMissions
        ? JSON.parse(storedMissions)
        : [];

      if (!Array.isArray(existingMissions)) {
        throw new Error("Saved missions data is not valid.");
      }

      const updatedMissions = [...existingMissions, mission];

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedMissions)
      );

      window.dispatchEvent(
        new Event("trajectoryMissionsUpdated")
      );

      localStorage.removeItem("trajectoryMissionPromptDismissed");

      navigate("/missions");
    } catch (storageError) {
      console.error("Could not save mission:", storageError);
      setError("Your mission couldn't be saved. Please try again.");
    }
  }

  return (
    <main className="add-mission-page">
      <div className="add-mission-container">
        <button
          type="button"
          className="add-mission-back"
          onClick={() => navigate("/dashboard")}
        >
          <FiArrowLeft />
          Back to dashboard
        </button>

        <header className="add-mission-heading">
          <span className="add-mission-eyebrow">MAKE IT HAPPEN</span>

          <div className="add-mission-title-row">
            <div>
              <h1>Create a new mission.</h1>
              <p>
                What's something you've been meaning to get done?
                Let's break it down.
              </p>
            </div>

            <span className="add-mission-main-icon">
              <FiTarget />
            </span>
          </div>
        </header>

        <form className="add-mission-form" onSubmit={handleSave}>
          <section className="add-mission-section">
            <div className="add-mission-section-heading">
              <span>01</span>
              <div>
                <h2>What's the mission?</h2>
                <p>Start with the thing you want to accomplish.</p>
              </div>
            </div>

            <label htmlFor="mission-title">Mission name</label>
            <input
              id="mission-title"
              type="text"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                setError("");
              }}
              placeholder="e.g. Finish my research assignment"
              maxLength={100}
            />

            <label htmlFor="mission-description">
              A little more detail
            </label>
            <textarea
              id="mission-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What does getting this done look like?"
              rows={3}
            />

            <label htmlFor="mission-category">Category</label>
            <select
              id="mission-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option>Study</option>
              <option>Work</option>
              <option>Personal</option>
              <option>Daily life</option>
              <option>Wellbeing</option>
              <option>Other</option>
            </select>
          </section>

          <section className="add-mission-section">
            <div className="add-mission-section-heading">
              <span>02</span>
              <div>
                <h2>Break it into steps.</h2>
                <p>
                  We've added a few starter steps. Edit them to suit
                  your mission, or add your own.
                </p>
              </div>
            </div>

            <div className="add-mission-steps">
              {steps.map((step, index) => (
                <article
                  className="add-mission-step"
                  key={index}
                >
                  <div className="add-mission-step-number">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="add-mission-step-fields">
                    <label htmlFor={`step-title-${index}`}>
                      Step {index + 1}
                    </label>

                    <input
                      id={`step-title-${index}`}
                      type="text"
                      value={step.title}
                      onChange={(event) =>
                        updateStep(index, "title", event.target.value)
                      }
                      placeholder="What needs to happen?"
                    />

                    <textarea
                      value={step.description}
                      onChange={(event) =>
                        updateStep(
                          index,
                          "description",
                          event.target.value
                        )
                      }
                      placeholder="Optional: add a little guidance"
                      rows={2}
                      aria-label={`Description for step ${index + 1}`}
                    />

                    <input
                      type="text"
                      value={step.duration}
                      onChange={(event) =>
                        updateStep(
                          index,
                          "duration",
                          event.target.value
                        )
                      }
                      placeholder="Estimated time, e.g. 10 min"
                      aria-label={`Estimated time for step ${index + 1}`}
                    />
                  </div>

                  <button
                    type="button"
                    className="add-mission-remove-step"
                    onClick={() => removeStep(index)}
                    aria-label={`Remove step ${index + 1}`}
                    title="Remove step"
                  >
                    <FiTrash2 />
                  </button>
                </article>
              ))}
            </div>

            <button
              type="button"
              className="add-mission-add-step"
              onClick={addStep}
            >
              <FiPlus />
              Add another step
            </button>
          </section>

          {error && (
            <p className="add-mission-error" role="alert">
              {error}
            </p>
          )}

          <div className="add-mission-actions">
            <button
              type="button"
              className="add-mission-cancel"
              onClick={() => navigate("/missions")}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="add-mission-submit"
            >
              Create my mission
              <FiArrowLeft className="add-mission-submit-icon" />
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default AddMission;
