import React from "react";

interface InfoProps {
  playerCount: number;
}

const Info: React.FC<InfoProps> = ({ playerCount }) => {
  return (
    <div className="info">
      Great! This team has <strong>{playerCount}</strong> players, which meets
      the minimum requirement (11 or more).
    </div>
  );
};

export default Info;