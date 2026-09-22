import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing/Landing";
import Login from "./pages/Login/Login";
import Questionnaire from "./pages/Questionnaire/Questionnaire";


function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/questionnaire" element={<Questionnaire />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;