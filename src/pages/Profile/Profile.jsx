
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiSave, FiUser, FiEdit3 } from "react-icons/fi";
import "./Profile.css";

function readProfile() {
  try {
    return JSON.parse(localStorage.getItem("trajectoryProfile") || "null") || {};
  } catch {
    return {};
  }
}

function Profile() {
  const navigate = useNavigate();
  const [name, setName] = useState(localStorage.getItem("trajectoryName") || "");
  const [profile, setProfile] = useState(readProfile);
  const [saved, setSaved] = useState(false);

  const fields = [
    ["mainChallenge", "Main challenge"],
    ["preferredApproach", "Preferred approach"],
    ["workStyle", "Working style"],
    ["motivationStyle", "Motivation"],
    ["taskListExperience", "Task list experience"],
    ["primaryGoal", "Primary goal"],
  ];

  function updateField(key, value) {
    setProfile((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  function saveProfile(event) {
    event.preventDefault();
    const cleanName = name.trim();

    if (cleanName) {
      localStorage.setItem("trajectoryName", cleanName);
    }

    localStorage.setItem("trajectoryProfile", JSON.stringify(profile));
    window.dispatchEvent(new Event("trajectoryProfileUpdated"));
    window.dispatchEvent(new Event("trajectoryNameUpdated"));
    setSaved(true);
  }

  return (
    <main className="profile-page">
      <header className="profile-page-header">
        <Link to="/dashboard" className="profile-back"><FiArrowLeft /> Dashboard</Link>
        <Link to="/" className="profile-logo">trajectory.</Link>
      </header>

      <section className="profile-page-content">
        <span className="profile-eyebrow">YOUR SPACE</span>
        <h1>Your profile.</h1>
        <p className="profile-intro">Your preferences help Trajectory shape a working style that feels more manageable for you.</p>

        <form className="profile-form" onSubmit={saveProfile}>
          <div className="profile-section-heading"><FiUser /><div><h2>Personal details</h2><p>The name we'll use to greet you.</p></div></div>

          <label htmlFor="profile-name">Your name</label>
          <input id="profile-name" value={name} onChange={(event) => { setName(event.target.value); setSaved(false); }} placeholder="What should we call you?" />

          <div className="profile-section-heading profile-preferences-heading"><FiEdit3 /><div><h2>Productivity preferences</h2><p>Update your answers whenever your needs change.</p></div></div>

          {fields.map(([key, label]) => (
            <div className="profile-field" key={key}>
              <label htmlFor={`profile-${key}`}>{label}</label>
              <input
                id={`profile-${key}`}
                value={profile[key] || ""}
                onChange={(event) => updateField(key, event.target.value)}
                placeholder="Not set yet"
              />
            </div>
          ))}

          <div className="profile-save-row">
            <button className="profile-save-button" type="submit"><FiSave /> Save changes</button>
            {saved && <span className="profile-saved-message">Changes saved ✓</span>}
          </div>
        </form>

        <button className="profile-questionnaire-link" onClick={() => navigate("/questionnaire")}>
          Retake onboarding questionnaire →
        </button>
      </section>
    </main>
  );
}

export default Profile;
