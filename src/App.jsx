
import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";

import Landing from "./pages/Landing/Landing";
import Login from "./pages/Login/Login";
import Questionnaire from "./pages/Questionnaire/Questionnaire";
import Loading from "./pages/Loading/Loading";
import Dashboard from "./pages/Dashboard/Dashboard";
import Missions from "./pages/Missions/Missions";
import MissionDetail from "./pages/MissionDetail/MissionDetail";
import AddMission from "./pages/AddMission/AddMission";
import Rewards from "./pages/Rewards/Rewards";
import Timer from "./pages/Timer/Timer";
import Calendar from "./pages/Calendar/Calendar";
import Profile from "./pages/Profile/Profile";
import Assistant from "./pages/Assistant/Assistant";

function TimerNavigationGuard() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let timer = null;

    try {
      timer = JSON.parse(localStorage.getItem("trajectoryFocusTimer") || "null");
    } catch {
      timer = null;
    }

    const active = timer?.status === "active" && Number(timer.endsAt) > Date.now();

    if (active && location.pathname !== "/timer") {
      navigate("/timer", { replace: true });
    }
  }, [location.pathname, navigate]);

  return null;
}

function AppRoutes() {
  return (
    <>
      <TimerNavigationGuard />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/questionnaire" element={<Questionnaire />} />
        <Route path="/loading" element={<Loading />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/missions" element={<Missions />} />
        <Route path="/missions/new" element={<AddMission />} />
        <Route path="/missions/:id" element={<MissionDetail />} />
        <Route path="/rewards" element={<Rewards />} />
        <Route path="/timer" element={<Timer />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/assistant" element={<Assistant />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
