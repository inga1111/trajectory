
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiClock, FiCheck, FiAlertCircle } from "react-icons/fi";
import "./Timer.css";

const TIMER_KEY = "trajectoryFocusTimer";

function readTimer() {
  try {
    return JSON.parse(localStorage.getItem(TIMER_KEY) || "null");
  } catch {
    return null;
  }
}

function Timer() {
  const [savedTimer, setSavedTimer] = useState(readTimer);
  const [minutes, setMinutes] = useState(25);
  const [showWarning, setShowWarning] = useState(false);
  const [now, setNow] = useState(Date.now());

  const isActive = savedTimer?.status === "active";
  const isComplete = savedTimer?.status === "complete";

  useEffect(() => {
    if (!isActive) return undefined;

    const interval = window.setInterval(() => {
      const currentTime = Date.now();
      setNow(currentTime);

      if (currentTime >= savedTimer.endsAt) {
        const completed = {
          ...savedTimer,
          status: "complete",
          completedAt: new Date().toISOString(),
        };

        localStorage.setItem(TIMER_KEY, JSON.stringify(completed));
        setSavedTimer(completed);
      }
    }, 500);

    return () => window.clearInterval(interval);
  }, [isActive, savedTimer]);

  useEffect(() => {
    if (!isActive) return undefined;

    const warnBeforeLeaving = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", warnBeforeLeaving);

    return () => {
      window.removeEventListener("beforeunload", warnBeforeLeaving);
    };
  }, [isActive]);

  const remainingSeconds = isActive
    ? Math.max(0, Math.ceil((savedTimer.endsAt - now) / 1000))
    : 0;

  const displayMinutes = String(Math.floor(remainingSeconds / 60)).padStart(2, "0");
  const displaySeconds = String(remainingSeconds % 60).padStart(2, "0");

  function startTimer() {
    const timer = {
      duration: minutes,
      endsAt: Date.now() + minutes * 60 * 1000,
      status: "active",
      startedAt: new Date().toISOString(),
    };

    localStorage.setItem(TIMER_KEY, JSON.stringify(timer));
    setSavedTimer(timer);
    setShowWarning(false);
    setNow(Date.now());
  }

  function resetTimer() {
    localStorage.removeItem(TIMER_KEY);
    setSavedTimer(null);
    setShowWarning(false);
  }

  return (
    <main className="timer-page">
      <header className="timer-header">
        <Link to="/dashboard" className="timer-back">
          <FiArrowLeft /> Dashboard
        </Link>
        <Link to="/dashboard" className="timer-logo">trajectory.</Link>
      </header>

      <section className="timer-content">
        {!isActive && !isComplete && (
          <>
            <span className="timer-eyebrow">A LITTLE TIME FOR YOU</span>
            <div className="timer-icon"><FiClock /></div>
            <h1>Let's focus.</h1>
            <p className="timer-intro">
              Choose a time, settle in, and give one thing your attention.
              You don't have to do everything. Just this.
            </p>

            <div className="timer-setup">
              <label htmlFor="focus-duration">Focus duration</label>
              <div className="timer-input-wrap">
                <input
                  id="focus-duration"
                  type="number"
                  min="1"
                  max="180"
                  value={minutes}
                  onChange={(event) => {
                    const value = Number(event.target.value);
                    setMinutes(Math.min(180, Math.max(1, value || 1)));
                  }}
                />
                <span>minutes</span>
              </div>

              <div className="timer-presets">
                {[15, 25, 40, 60].map((value) => (
                  <button
                    type="button"
                    key={value}
                    className={minutes === value ? "selected" : ""}
                    onClick={() => setMinutes(value)}
                  >
                    {value} min
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="timer-start"
                onClick={() => setShowWarning(true)}
              >
                Start focus session →
              </button>
            </div>
          </>
        )}

        {isActive && (
          <div className="timer-running">
            <span className="timer-eyebrow">FOCUS MODE</span>
            <div className="timer-orbit"><span>✦</span></div>
            <h1>You're doing it.</h1>
            <p className="timer-intro">
              Stay with the task in front of you. One moment at a time.
            </p>
            <div className="timer-countdown">
              {displayMinutes}:{displaySeconds}
            </div>
            <p className="timer-running-note">
              Your session is in progress. Keep going.
            </p>
            <div className="timer-progress-track">
              <div
                className="timer-progress-fill"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(0, (1 - remainingSeconds / (savedTimer.duration * 60)) * 100)
                  )}%`,
                }}
              />
            </div>
            <p className="timer-small-note">
              This screen will remain active until your session ends.
            </p>
          </div>
        )}

        {isComplete && (
          <div className="timer-complete">
            <div className="timer-success-icon"><FiCheck /></div>
            <span className="timer-eyebrow">SESSION COMPLETE</span>
            <h1>You showed up.</h1>
            <p className="timer-intro">
              You gave {savedTimer.duration} minutes to something that matters.
              That counts. Take a breath before your next thing.
            </p>
            <button className="timer-start" onClick={resetTimer}>
              Start another session
            </button>
            <Link to="/dashboard" className="timer-dashboard-link">
              Back to dashboard
            </Link>
          </div>
        )}
      </section>

      {showWarning && (
        <div className="timer-modal-backdrop">
          <div className="timer-modal">
            <div className="timer-warning-icon"><FiAlertCircle /></div>
            <h2>Ready to commit?</h2>
            <p>
              Once the timer begins, you cannot exit the focus session
              from inside Trajectory until the time is up.
            </p>
            <p className="timer-modal-small">
              Your browser or device can still be closed. If that happens,
              your timer will continue counting down when you return.
            </p>
            <button className="timer-start" onClick={startTimer}>
              Begin focus session
            </button>
            <button
              className="timer-cancel"
              onClick={() => setShowWarning(false)}
            >
              Not yet
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default Timer;
