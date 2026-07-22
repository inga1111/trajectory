import React from "react";
import { Link } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {

  return (
    <div className="dashboard">

      <section className="welcome">
        <p className="small-text">
          Good evening ✨
        </p>

        <h1>
          Ready to make progress,
          <br />
          Inga?
        </h1>

        <p>
          Your Trajectory is built around your energy,
          motivation and personal workflow.
        </p>
      </section>


      <section className="trajectory-card">

        <div>
          <p>Your focus style</p>
          <h2>
            Creative Explorer 🌱
          </h2>
        </div>

        <div className="progress">

          <div className="progress-circle">
            65%
          </div>

          <p>
            Today's momentum
          </p>

        </div>

      </section>



      <section className="mission-card">

        <p>
          Today's Mission
        </p>

        <h2>
          Complete your portfolio homepage
        </h2>

        <span>
          45 minutes • Creative task
        </span>


        <Link to="/mission/1">
          <button>
            Start Mission
          </button>
        </Link>

      </section>



      <section className="stats">

        <div>
          <h3>12</h3>
          <p>Completed</p>
        </div>


        <div>
          <h3>5</h3>
          <p>Day streak</p>
        </div>


        <div>
          <h3>82%</h3>
          <p>Focus</p>
        </div>

      </section>


      <Link to="/missions">
        <button className="secondary-btn">
          View All Missions
        </button>
      </Link>


    </div>
  );
}


export default Dashboard;