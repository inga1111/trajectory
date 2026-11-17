
import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Landing from "./pages/Landing/Landing";
import AuthPage from "./pages/Auth/AuthPage";
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
      timer = JSON.parse(
        localStorage.getItem("trajectoryFocusTimer") || "null"
      );
    } catch {
      timer = null;
    }

    const active =
      timer?.status === "active" &&
      Number(timer.endsAt) > Date.now();

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

        <Route
          path="/login"
          element={<AuthPage mode="login" />}
        />

        <Route
          path="/signup"
          element={<AuthPage mode="signup" />}
        />

        <Route
          path="/questionnaire"
          element={
            <ProtectedRoute>
              <Questionnaire />
            </ProtectedRoute>
          }
        />

        <Route
          path="/loading"
          element={
            <ProtectedRoute>
              <Loading />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/missions"
          element={
            <ProtectedRoute>
              <Missions />
            </ProtectedRoute>
          }
        />

        <Route
          path="/missions/new"
          element={
            <ProtectedRoute>
              <AddMission />
            </ProtectedRoute>
          }
        />

        <Route
          path="/missions/:id"
          element={
            <ProtectedRoute>
              <MissionDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/rewards"
          element={
            <ProtectedRoute>
              <Rewards />
            </ProtectedRoute>
          }
        />

        <Route
          path="/timer"
          element={
            <ProtectedRoute>
              <Timer />
            </ProtectedRoute>
          }
        />

        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <Calendar />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/assistant"
          element={
            <ProtectedRoute>
              <Assistant />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
