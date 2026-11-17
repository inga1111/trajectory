
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { supabase, isSupabaseConfigured } from "../../lib/supabase";
import "./AuthPage.css";

function AuthPage({ mode = "login" }) {
  const isSignup = mode === "signup";
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
              },
              emailRedirectTo: window.location.origin,
            },
          });

        if (signupError) throw signupError;

        if (data.session) {
          navigate("/questionnaire", { replace: true });
        } else {
          setNotice(
            "Your account has been created! Check your email for a confirmation link before signing in."
          );
        }
      } else {
        const { error: loginError } =
          await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

        if (loginError) throw loginError;

        const hasExistingTrajectory =
          localStorage.getItem("trajectoryProfile") ||
          localStorage.getItem("trajectoryOnboarding");

        navigate(
          hasExistingTrajectory ? "/dashboard" : "/questionnaire",
          { replace: true }
        );
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <nav className="auth-nav">
        <Link to="/" className="auth-logo">
          trajectory.
        </Link>

        <Link to="/" className="auth-back">
          Back to home
        </Link>
      </nav>

      <section className="auth-card">
        <div className="auth-heading">
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
                Good to have
                <span> you back.</span>
              </>
            )}
          </h1>

          <p>
            {isSignup
              ? "Create your account and let's find a system that works for your brain."
              : "Sign in to pick up where you left off."}
          </p>
        </div>

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
            Email address
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
                ? "Create my account"
                : "Sign in"}
          </button>
        </form>

        <p className="auth-switch">
          {isSignup ? "Already have an account?" : "New to Trajectory?"}{" "}
          <Link to={isSignup ? "/login" : "/signup"}>
            {isSignup ? "Sign in" : "Create an account"}
          </Link>
        </p>
      </section>

      <p className="auth-footer">
        A little progress is still progress.
      </p>
    </main>
  );
}

export default AuthPage;
