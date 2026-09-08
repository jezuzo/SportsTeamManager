import React from "react";
import { Routes, Route } from "react-router-dom";
import Menu from "./components/Menu";
import Footer from "./components/Footer";
import Body from "./components/Body";
import TeamList from "./pages/TeamList";
import TeamDetails from "./pages/TeamDetails";

const App: React.FC = () => {
  return (
    <div className="app-container">
      <Menu />
      <div className="team-container">
      <Body>
        <Routes>
          <Route path="/" element={<TeamList />} />
          <Route path="/teams/:id" element={<TeamDetails />} />
        </Routes>
      </Body>
      </div>
      <Footer />
    </div>
  );
};

export default App;