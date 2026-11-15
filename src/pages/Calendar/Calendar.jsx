
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiChevronLeft, FiChevronRight, FiPlus, FiTrash2, FiCalendar } from "react-icons/fi";
import "./Calendar.css";

const STORAGE_KEY = "trajectoryCalendarTasks";

function readTasks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function Calendar() {
  const [tasks, setTasks] = useState(readTasks);
  const [selectedDate, setSelectedDate] = useState(dateKey(new Date()));
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [newTask, setNewTask] = useState("");
  const [showForm, setShowForm] = useState(false);

  const days = useMemo(() => {
    const firstDay = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth(),
      1
    );
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth() + 1,
      0
    ).getDate();

    return [
      ...Array(startOffset).fill(null),
      ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
    ];
  }, [visibleMonth]);

  const selectedTasks = tasks.filter((task) => task.date === selectedDate);

  function saveTasks(updatedTasks) {
    setTasks(updatedTasks);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTasks));
  }

  function addTask(event) {
    event.preventDefault();
    if (!newTask.trim()) return;

    saveTasks([
      ...tasks,
      {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        title: newTask.trim(),
        date: selectedDate,
        completed: false,
      },
    ]);

    setNewTask("");
    setShowForm(false);
  }

  function toggleTask(id) {
    saveTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  }

  function deleteTask(id) {
    saveTasks(tasks.filter((task) => task.id !== id));
  }

  function changeMonth(direction) {
    setVisibleMonth(
      new Date(
        visibleMonth.getFullYear(),
        visibleMonth.getMonth() + direction,
        1
      )
    );
  }

  const todayKey = dateKey(new Date());

  return (
    <main className="calendar-page">
      <header className="calendar-header">
        <Link to="/dashboard" className="calendar-back">
          <FiArrowLeft /> Dashboard
        </Link>
        <Link to="/dashboard" className="calendar-logo">trajectory.</Link>
      </header>

      <section className="calendar-content">
        <div className="calendar-title-row">
          <div>
            <span className="calendar-eyebrow">MAKE SPACE FOR WHAT MATTERS</span>
            <h1>Your calendar.</h1>
            <p>Give your tasks a place in your day, one date at a time.</p>
          </div>
          <button
            className="calendar-add-button"
            onClick={() => setShowForm(!showForm)}
          >
            <FiPlus /> Add a task
          </button>
        </div>

        {showForm && (
          <form className="calendar-add-form" onSubmit={addTask}>
            <div>
              <label htmlFor="calendar-task">Task for {new Date(`${selectedDate}T12:00:00`).toLocaleDateString("en-ZA", { day: "numeric", month: "long" })}</label>
              <input
                id="calendar-task"
                value={newTask}
                onChange={(event) => setNewTask(event.target.value)}
                placeholder="What would you like to get done?"
                autoFocus
              />
            </div>
            <button type="submit" disabled={!newTask.trim()}>Save task</button>
          </form>
        )}

        <div className="calendar-layout">
          <section className="calendar-card">
            <div className="calendar-month-heading">
              <div>
                <span className="calendar-eyebrow">YOUR OVERVIEW</span>
                <h2>
                  {visibleMonth.toLocaleDateString("en-ZA", {
                    month: "long",
                    year: "numeric",
                  })}
                </h2>
              </div>
              <div className="calendar-month-controls">
                <button aria-label="Previous month" onClick={() => changeMonth(-1)}>
                  <FiChevronLeft />
                </button>
                <button aria-label="Next month" onClick={() => changeMonth(1)}>
                  <FiChevronRight />
                </button>
              </div>
            </div>

            <div className="calendar-grid">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div className="calendar-weekday" key={day}>{day}</div>
              ))}

              {days.map((day, index) => {
                if (!day) {
                  return <div className="calendar-day empty" key={`empty-${index}`} />;
                }

                const currentDate = new Date(
                  visibleMonth.getFullYear(),
                  visibleMonth.getMonth(),
                  day
                );
                const key = dateKey(currentDate);
                const dayTasks = tasks.filter((task) => task.date === key);
                const isSelected = selectedDate === key;
                const isToday = todayKey === key;

                return (
                  <button
                    type="button"
                    key={key}
                    className={[
                      "calendar-day",
                      isSelected ? "selected" : "",
                      isToday ? "today" : "",
                    ].join(" ")}
                    onClick={() => setSelectedDate(key)}
                  >
                    <span>{day}</span>
                    {dayTasks.length > 0 && (
                      <i className="calendar-day-dot" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="calendar-legend">
              <span><i /> Days with tasks</span>
              <span><b /> Today</span>
            </div>
          </section>

          <section className="calendar-agenda">
            <div className="calendar-agenda-heading">
              <div className="calendar-agenda-icon"><FiCalendar /></div>
              <div>
                <span className="calendar-eyebrow">YOUR PLAN</span>
                <h2>
                  {new Date(`${selectedDate}T12:00:00`).toLocaleDateString("en-ZA", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </h2>
              </div>
            </div>

            {selectedTasks.length === 0 ? (
              <div className="calendar-empty">
                <span>✦</span>
                <h3>A little room to breathe.</h3>
                <p>No tasks planned for this day yet. Add something whenever you're ready.</p>
                <button onClick={() => setShowForm(true)}>
                  <FiPlus /> Add a task
                </button>
              </div>
            ) : (
              <div className="calendar-task-list">
                {selectedTasks.map((task) => (
                  <div
                    className={`calendar-task ${task.completed ? "completed" : ""}`}
                    key={task.id}
                  >
                    <button
                      className="calendar-task-check"
                      aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
                      onClick={() => toggleTask(task.id)}
                    >
                      {task.completed ? "✓" : ""}
                    </button>
                    <span>{task.title}</span>
                    <button
                      className="calendar-task-delete"
                      aria-label="Delete task"
                      onClick={() => deleteTask(task.id)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <p className="calendar-task-count">
              {selectedTasks.filter((task) => task.completed).length} of {selectedTasks.length} tasks completed
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}

export default Calendar;
