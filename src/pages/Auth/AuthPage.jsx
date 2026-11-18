
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { supabase, isSupabaseConfigured } from "../../lib/supabase";
import "./AuthPage.css";

function AuthPage({ mode = "login" }) {
  const isSignup = mode === "signup";
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(() =>
    searchParams.get("confirmed") === "1"
      ? "Your email has been confirmed! You can now sign in and get started."
      : ""
  );
  const [submitting, setSubmitting] = useState(false);
  const [showOnboardingWelcome, setShowOnboardingWelcome] = useState(false);

  function saveUserName(user) {
    const fullName = user?.user_metadata?.full_name?.trim();

    if (fullName) {
      localStorage.setItem("trajectoryName", fullName);
      window.dispatchEvent(new Event("trajectoryNameUpdated"));
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setNotice("");

    if (!isSupabaseConfigured || !supabase) {
      setError(
        "Trajectory authentication hasn't been configured yet. Please check the Supabase connection."
      );
      return;
    }

    setSubmitting(true);

    try {
      if (isSignup) {
        const { data, error: signupError } =
          await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
              data: {
                full_name: name.trim(),
                trajectory_onboarding_completed: false,
              },
              emailRedirectTo: `${window.location.origin}/login?confirmed=1`,
            },
          });

        if (signupError) throw signupError;

        if (data.session && data.user) {
          saveUserName(data.user);
          setShowOnboardingWelcome(true);
        } else {
          setNotice(
            "Your account has been created! Check your email for a confirmation link before signing in."
          );
        }
      } else {
        const { data, error: loginError } =
          await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

        if (loginError) throw loginError;

        const user = data.user;
        saveUserName(user);

        const onboardingCompleted =
          user?.user_metadata?.trajectory_onboarding_completed === true;

        if (onboardingCompleted) {
          navigate("/dashboard", { replace: true });
        } else {
          setShowOnboardingWelcome(true);
        }
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function startOnboarding() {
    setShowOnboardingWelcome(false);
    navigate("/questionnaire", { replace: true });
  }

  return (
    <main className="auth-page">
      <nav className="auth-nav">
        <Link to="/" className="auth-logo">
          trajectory.
        </Link>

        <Link to="/" className="auth-back">
          ← Back home
        </Link>
      </nav>

      <div className="auth-main">
        <section className="auth-heading">
          <p className="auth-eyebrow">
            {isSignup ? "YOUR JOURNEY STARTS HERE" : "WELCOME BACK"}
          </p>

          <h1>
            {isSignup ? (
              <>
                Let's build your
                <span> trajectory.</span>
              </>
            ) : (
              <>
                Ready to get
                <span> moving?</span>
              </>
            )}
          </h1>

          <p className="auth-description">
            {isSignup
              ? "Create your account and let's find a system that works for your brain."
              : "Pick up where you left off and keep your trajectory going."}
          </p>
        </section>

        <section className="auth-card">
          <form className="auth-form" onSubmit={handleSubmit}>
            {isSignup && (
              <label>
                Your name
                <input
                  type="text"
                  placeholder="What should we call you?"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                  required
                />
              </label>
            )}

            <label>
              Email
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={isSignup ? "new-password" : "current-password"}
                minLength={8}
                required
              />
            </label>

            {error && (
              <p className="auth-message auth-error" role="alert">
                {error}
              </p>
            )}

            {notice && (
              <p className="auth-message auth-success" role="status">
                {notice}
              </p>
            )}

            <button
              type="submit"
              className="auth-submit"
              disabled={submitting}
            >
              {submitting
                ? "Please wait..."
                : isSignup
                  ? "Create my trajectory"
                  : "Log in →"}
            </button>
          </form>

          <div className="auth-divider">
            <span />
            <span>or</span>
            <span />
          </div>

          <p className="auth-switch">
            {isSignup ? "Already have an account?" : "New to Trajectory?"}{" "}
            <Link to={isSignup ? "/login" : "/signup"}>
              {isSignup ? "Log in" : "Create my trajectory"}
            </Link>
          </p>
        </section>
      </div>

      <p className="auth-footer">
        A little progress is still progress.
      </p>

      {showOnboardingWelcome && (
        <div className="onboarding-welcome-backdrop">
          <section
            className="onboarding-welcome-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="onboarding-welcome-title"
          >
            <div className="onboarding-welcome-decoration">✦</div>

            <span className="auth-eyebrow">
              A LITTLE INTRODUCTION
            </span>

            <h2 id="onboarding-welcome-title">
              First, let's get to know you.
            </h2>

            <p>
              Before we get started, we'll ask you a few quick questions
              about your productivity style, habits and preferences.
            </p>

            <p>
              Your answers will help us shape Trajectory around the way
              you work best.
            </p>

            <div className="onboarding-welcome-note">
              No pressure. No perfect answers. Just a starting point.
            </div>

            <button
              type="button"
              className="auth-submit"
              onClick={startOnboarding}
            >
              Let's get started →
            </button>
          </section>
        </div>
      )}
    </main>
  );
}

export default AuthPage;
