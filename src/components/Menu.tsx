import React from "react";
import { Link } from "react-router-dom";

const Menu: React.FC = () => {
  return (
    <header className="app-menu">
      <div className="app-menu__brand">
        ⚽ Sports Teams Manager
      </div>
      <nav className="app-menu__links">
        <Link to="/">Teams</Link>
      </nav>
    </header>
  );
};

export default Menu;