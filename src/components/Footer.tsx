import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="app-footer">
      Sports Teams Manager &copy; {new Date().getFullYear()}
    </footer>
  );
};

export default Footer;