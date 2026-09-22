import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Loading.css";

function Loading() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/dashboard");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <main className="loading-page">

      <div className="loading-content">

        <div className="loading-orbit">
          <div className="loading-dot"></div>
        </div>

        <p className="loading-eyebrow">
          TRAJECTORY
        </p>

        <h1>
          Building your
          <span> trajectory.</span>
        </h1>

        <p className="loading-message">
          We're figuring out what will help you
          work with your brain, not against it.
        </p>

        <div className="loading-status">
          <span className="status-dot"></span>
          Personalising your experience...
        </div>

      </div>

    </main>
  );
}

export default Loading;