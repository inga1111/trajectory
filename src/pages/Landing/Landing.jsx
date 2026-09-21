import { Link } from "react-router-dom";
import "./Landing.css";

function Landing() {
  return (
    <main className="landing">

      <nav className="landing-nav">
        <div className="logo">trajectory.</div>

        <div className="nav-links">
          <a href="#about">About</a>
          <a href="#how-it-works">How it works</a>
          <Link to="/login" className="login-link">
            Log in
          </Link>
        </div>
      </nav>

      <section className="hero">

        <div className="hero-text">
          <p className="eyebrow">PRODUCTIVITY, BUT DIFFERENT.</p>

          <h1>
            Helping neurodivergents
            <span> get shit done.</span>
          </h1>

          <p className="hero-description">
            Trajectory helps you turn overwhelming tasks into
            manageable steps, build momentum, and actually get
            where you're trying to go.
          </p>

          <div className="hero-buttons">
            <Link to="/questionnaire" className="primary-button">
              Build my trajectory →
            </Link>

            <a href="#how-it-works" className="secondary-button">
              See how it works
            </a>
          </div>
        </div>

        <div className="hero-visual">
          <div className="orbit orbit-one"></div>
          <div className="orbit orbit-two"></div>

          <div className="trajectory-card">
            <div className="card-top">
              <span>YOUR TRAJECTORY</span>
              <span>✦</span>
            </div>

            <div className="progress-circle">
              <strong>72%</strong>
              <small>momentum</small>
            </div>

            <div className="mini-task">
              <span className="check">✓</span>
              Finish research draft
            </div>

            <div className="mini-task">
              <span className="check">✓</span>
              Submit assignment
            </div>

            <div className="mini-task unfinished">
              <span className="empty-check"></span>
              Take a break
            </div>
          </div>
        </div>

      </section>

      <section className="intro-section" id="about">
        <p className="eyebrow">BUILT FOR YOUR BRAIN</p>

        <h2>
          You don't need more discipline.
          <br />
          You need a system that works with you.
        </h2>

        <p>
          Trajectory adapts the way you plan, prioritise and
          approach your tasks around how you actually function.
        </p>
      </section>

      <section className="how-section" id="how-it-works">
        <div>
          <p className="eyebrow">HOW IT WORKS</p>
          <h2>From stuck to started.</h2>
        </div>

        <div className="steps">

          <div className="step">
            <span>01</span>
            <h3>Tell us about you</h3>
            <p>
              Answer a few questions about how you work,
              focus and get things done.
            </p>
          </div>

          <div className="step">
            <span>02</span>
            <h3>Get your trajectory</h3>
            <p>
              Your responses shape a personalised approach
              to your tasks and goals.
            </p>
          </div>

          <div className="step">
            <span>03</span>
            <h3>Start moving</h3>
            <p>
              Break things down, build momentum and keep
              moving forward.
            </p>
          </div>

        </div>
      </section>

    </main>
  );
}

export default Landing;