import React from "react";
import { Player as PlayerType } from "../types";
import { deletePlayer } from "../api";

interface PlayerProps {
  player: PlayerType;
  onDelete: (id?: string) => void;
}

const Player: React.FC<PlayerProps> = ({ player, onDelete }) => {
  const handleDelete = async () => {
  if (confirm(`Delete player "${player.name}"?`)) {
    await deletePlayer(player.id);
    onDelete(player.id);
  }
  };
  return (
    <div className="player">
      <div className="player__header">
        <span>{player.name}</span>
        <span>#{player.number}</span>
      </div>
      <div className="player__meta">
        Position: <strong>{player.position}</strong>
      </div>
       <button className="delete-btn" onClick={handleDelete}>✕</button>
    </div>
  );
};

export default Player;