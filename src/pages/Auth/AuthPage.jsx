import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "../../lib/supabase";
import trajectoryMascot from "../../assets/trajectory-mascot.png";
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
      ? "Your email has been confirmed! Welcome to Trajectory. You can now sign in and get started."
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
      setError("Trajectory authentication hasn't been configured yet. Please check the Supabase connection.");
      return;
    }

    setSubmitting(true);
    try {
      if (isSignup) {
        const { data, error: signupError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: name.trim() },
            emailRedirectTo: `${window.location.origin}/login?confirmed=1`,
          },
        });

        if (signupError) throw signupError;
        if (data.session) {
          saveUserName(data.user);
          setShowOnboardingWelcome(true);
        } else {
          setNotice("Your account has been created! Check your email for a confirmation link before signing in.");
        }
      } else {
        const { data, error: loginError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (loginError) throw loginError;

        saveUserName(data.user);
        const accountOnboardingKey = `trajectoryOnboardingCompleted:${data.user.id}`;
        const onboardingCompleted =
          data.user?.user_metadata?.trajectory_onboarding_completed === true ||
          localStorage.getItem(accountOnboardingKey) === "true";

        if (onboardingCompleted) navigate("/dashboard", { replace: true });
        else setShowOnboardingWelcome(true);
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePasswordReset() {
    setError("");
    setNotice("");
    if (!email.trim()) {
      setError("Enter your email address first, then choose Forgot password.");
      return;
    }
    if (!isSupabaseConfigured || !supabase) {
      setError("Password reset is unavailable because authentication isn't configured.");
      return;
    }

    setSubmitting(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/login`,
      });
      if (resetError) throw resetError;
      setNotice("If an account exists for that email, a password reset link has been sent.");
    } catch (err) {
      setError(err.message || "We couldn't send a password reset link. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <nav className="auth-nav">
        <Link to="/" className="auth-logo">trajectory.</Link>
        <Link to="/" className="auth-back">← Back home</Link>
      </nav>

      <section className="auth-layout">
        <div className="auth-heading">
          <p className="auth-eyebrow">{isSignup ? "YOUR JOURNEY STARTS HERE" : "WELCOME BACK"}</p>
          <h1>
            {isSignup ? (
              <>Let's build your <span>trajectory.</span></>
            ) : (
              <>Ready to get <span>moving?</span></>
            )}
          </h1>
          <p>
            {isSignup
              ? "Create your account and find a system that works with your brain."
              : "Pick up where you left off and keep your trajectory going."}
          </p>
        </div>

        <div className="auth-panel">
          <form className="auth-form" onSubmit={handleSubmit}>
            {isSignup && (
              <label>
                Name
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
              <span className="auth-label-row">
                <span>Password</span>
                {!isSignup && (
                  <button type="button" className="auth-forgot" onClick={handlePasswordReset} disabled={submitting}>
                    Forgot password?
                  </button>
                )}
              </span>
              <input
                type="password"
                placeholder={isSignup ? "At least 8 characters" : "Enter your password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={isSignup ? "new-password" : "current-password"}
                minLength={8}
                required
              />
            </label>

            {error && <p className="auth-message auth-error" role="alert">{error}</p>}
            {notice && <p className="auth-message auth-success" role="status">{notice}</p>}

            <button type="submit" className="auth-submit" disabled={submitting}>
              {submitting ? "Please wait..." : isSignup ? "Create my account" : "Log in →"}
            </button>
          </form>

          {!isSignup && (
            <div className="auth-divider"><span>or</span></div>
          )}

          <Link to={isSignup ? "/login" : "/signup"} className="auth-secondary-action">
            {isSignup ? "I already have an account" : "Create my trajectory"}
          </Link>

          {isSignup && (
            <p className="auth-switch">Already have an account? <Link to="/login">Log in</Link></p>
          )}
        </div>
      </section>

      <p className="auth-footer">A little progress is still progress.</p>

      {showOnboardingWelcome && (
        <div className="onboarding-welcome-backdrop">
          <section className="onboarding-welcome-modal" role="dialog" aria-modal="true" aria-labelledby="onboarding-welcome-title">
            <img className="onboarding-welcome-mascot" src={trajectoryMascot} alt="" />
            <span className="auth-eyebrow">YOUR JOURNEY STARTS HERE</span>
            <h2 id="onboarding-welcome-title">First, let's get to know you.</h2>
            <p>We'll take you through a few quick questions about your productivity style, habits and preferences.</p>
            <p>Your answers will help us personalise Trajectory and build a system that works with your brain, not against it.</p>
            <div className="onboarding-welcome-note">No pressure. No perfect answers. Just a starting point.</div>
            <button className="auth-submit" onClick={() => navigate("/questionnaire", { replace: true })}>Let's get started</button>
          </section>
        </div>
      )}
    </main>
  );
}

export default AuthPage;
