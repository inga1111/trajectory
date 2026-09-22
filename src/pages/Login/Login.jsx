import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  function handleLogin(event) {
    event.preventDefault();
    navigate("/dashboard");
  }

  return (
    <main className="login-page">

      <nav className="login-nav">
        <Link to="/" className="logo">
          trajectory.
        </Link>

        <Link to="/" className="back-link">
          ← Back home
        </Link>
      </nav>

      <section className="login-container">

        <div className="login-intro">
          <p className="eyebrow">WELCOME BACK</p>

          <h1>
            Ready to get
            <span> moving?</span>
          </h1>

          <p>
            Pick up where you left off and keep your
            trajectory going.
          </p>
        </div>

        <form className="login-form" onSubmit={handleLogin}>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="input-group">
            <div className="password-label">
              <label htmlFor="password">Password</label>
              <a href="#forgot">Forgot password?</a>
            </div>

            <input
              id="password"
              type="password"
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="login-button">
            Log in →
          </button>

          <div className="login-divider">
            <span>or</span>
          </div>

          <button
            type="button"
            className="guest-button"
            onClick={() => navigate("/questionnaire")}
          >
            Create my trajectory
          </button>

        </form>

      </section>

    </main>
  );
}

export default Login;