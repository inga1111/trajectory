import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing/Landing";
import Login from "./pages/Login/Login";
import Questionnaire from "./pages/Questionnaire/Questionnaire";
import Loading from "./pages/Loading/Loading";
import Dashboard from "./pages/Dashboard/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/questionnaire" element={<Questionnaire />} />
        <Route path="/loading" element={<Loading />} />
        <Route path="/loading" element={<Loading />} />
        <Route path="/dashboard" element={<Dashboard />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;