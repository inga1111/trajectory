
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiSend,
  FiPlus,
  FiZap,
  FiTarget,
  FiMessageCircle,
  FiCheck,
  FiLoader,
} from "react-icons/fi";
import "./Assistant.css";

const API_URL = "/api/chat";

function readJSON(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

function Assistant() {
  const profile = useMemo(
    () => readJSON("trajectoryOnboarding", {}),
    []
  );

  const missions = useMemo(
    () => readJSON("trajectoryMissions", []),
    []
  );

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hey! I'm your Trajectory assistant. Tell me what's on your mind, what you've been putting off, or what feels overwhelming. We can figure out your next step together.",
    },
  ]);

  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [missionDraft, setMissionDraft] = useState(null);
  const [savedNotice, setSavedNotice] = useState("");

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy, missionDraft]);

  async function sendMessage(messageText = input, mode = "chat") {
    const cleanText = messageText.trim();

    if (!cleanText || busy) return;

    const nextMessages = [
      ...messages,
      { role: "user", content: cleanText },
    ];

    setMessages(nextMessages);
    setInput("");
    setBusy(true);
    setError("");
    setMissionDraft(null);
    setSavedNotice("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: cleanText,
          mode,
          history: nextMessages.slice(-12).map(({ role, content }) => ({
            role,
            content,
          })),
          profile: profile.answers || [],
          missions: missions.slice(-15).map((mission) => ({
            title: mission.title,
            category: mission.category,
            completedSteps: mission.steps?.length || 0,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "The assistant couldn't respond. Please try again."
        );
      }

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: data.message || "Let's take this one step at a time.",
        },
      ]);

      if (data.missionDraft) {
        setMissionDraft(data.missionDraft);
      }
    } catch (requestError) {
      setError(
        requestError.message ||
          "Something went wrong. Check your assistant connection."
      );

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "I couldn't reach my AI service just now. Your message hasn't been lost — please try again once the connection is available.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function saveMissionDraft() {
    if (
      !missionDraft?.title ||
      !Array.isArray(missionDraft.steps) ||
      !missionDraft.steps.length
    ) {
      setError("This mission draft is missing its title or steps.");
      return;
    }

    const newMission = {
      id: `mission-${Date.now()}`,
      title: missionDraft.title,
      description:
        missionDraft.description ||
        "A mission created with your Trajectory assistant.",
      category: missionDraft.category || "Personal",
      duration: `${missionDraft.steps.length} steps`,
      difficulty: "Your own pace",
      encouragement: "One step at a time. You've got this.",
      steps: missionDraft.steps.map((step) => ({
        title: step.title,
        description: step.description || "",
        duration: step.duration || "10 min",
      })),
      createdAt: new Date().toISOString(),
    };

    const existing = readJSON("trajectoryMissions", []);

    localStorage.setItem(
      "trajectoryMissions",
      JSON.stringify([...existing, newMission])
    );

    window.dispatchEvent(new Event("trajectoryMissionsUpdated"));

    setMissionDraft(null);
    setSavedNotice(
      "Your AI-generated mission has been added to your mission board."
    );
  }

  function useSuggestion(text, mode = "chat") {
    sendMessage(text, mode);
  }

  return (
    <main className="assistant-page">
      <header className="assistant-header">
        <Link to="/dashboard" className="assistant-back">
          <FiArrowLeft /> Dashboard
        </Link>

        <Link to="/" className="assistant-logo">
          trajectory.
        </Link>
      </header>

      <div className="assistant-layout">
        <aside className="assistant-intro">
          <div className="assistant-orbit">
            <span>✦</span>
          </div>

          <span className="assistant-eyebrow">
            YOUR PERSONAL PRODUCTIVITY COMPANION
          </span>

          <h1>
            Let's figure it <span>out.</span>
          </h1>

          <p>
            No judgement. No pressure to have it all together. Just a little
            help turning the things in your head into something you can
            actually do.
          </p>

          <div className="assistant-suggestions">
            <span className="assistant-suggestions-label">TRY ASKING</span>

            <button
              onClick={() =>
                useSuggestion(
                  "I'm overwhelmed and don't know where to start. Help me choose one small thing."
                )
              }
            >
              <FiZap /> I'm overwhelmed. Help me start.
            </button>

            <button
              onClick={() =>
                useSuggestion(
                  "Help me break a task into manageable steps.",
                  "breakdown"
                )
              }
            >
              <FiTarget /> Break a task into steps.
            </button>

            <button
              onClick={() =>
                useSuggestion("Help me make a realistic plan for today.")
              }
            >
              <FiCheck /> Help me plan my day.
            </button>
          </div>

          <div className="assistant-profile-note">
            <FiMessageCircle />
            <p>
              Your responses are guided by the productivity preferences you
              shared during onboarding.
            </p>
          </div>
        </aside>

        <section className="assistant-chat">
          <div className="assistant-chat-heading">
            <div className="assistant-avatar">✦</div>

            <div>
              <strong>Your Trajectory companion</strong>
              <span>Here to help you get moving</span>
            </div>

            <span className="assistant-online-dot" />
          </div>

          <div className="assistant-messages" aria-live="polite">
            {messages.map((message, index) => (
              <div
                className={`assistant-message ${message.role}`}
                key={index}
              >
                {message.role === "assistant" && (
                  <span className="assistant-message-star">✦</span>
                )}

                <p>{message.content}</p>
              </div>
            ))}

            {busy && (
              <div className="assistant-message assistant">
                <span className="assistant-message-star">
                  <FiLoader />
                </span>

                <p className="assistant-thinking">
                  Thinking through this with you…
                </p>
              </div>
            )}

            {missionDraft && (
              <div className="assistant-mission-draft">
                <div className="draft-heading">
                  <FiTarget />
                  <span>YOUR MISSION DRAFT</span>
                </div>

                <h3>{missionDraft.title}</h3>
                <p>{missionDraft.description}</p>

                <div className="draft-steps">
                  {missionDraft.steps.map((step, index) => (
                    <div
                      className="draft-step"
                      key={`${step.title}-${index}`}
                    >
                      <span>{String(index + 1).padStart(2, "0")}</span>

                      <div>
                        <strong>{step.title}</strong>
                        <small>
                          {step.description} · {step.duration}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  className="assistant-save-mission"
                  onClick={saveMissionDraft}
                >
                  <FiPlus /> Add this mission to my board
                </button>
              </div>
            )}

            {savedNotice && (
              <p className="assistant-saved-notice">
                <FiCheck /> {savedNotice}
              </p>
            )}

            <div ref={bottomRef} />
          </div>

          {error && (
            <p className="assistant-error" role="alert">
              {error}
            </p>
          )}

          <form
            className="assistant-composer"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
          >
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="What's on your mind?"
              rows={2}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  sendMessage();
                }
              }}
              disabled={busy}
            />

            <button
              type="submit"
              disabled={busy || !input.trim()}
              aria-label="Send message"
            >
              <FiSend />
            </button>
          </form>

          <p className="assistant-disclaimer">
            A supportive planning tool, not a substitute for professional care.
          </p>
        </section>
      </div>
    </main>
  );
}

export default Assistant;
