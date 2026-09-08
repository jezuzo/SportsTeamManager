import React from "react";
import { Link } from "react-router-dom";
import { Team } from "../types";
import { deleteTeam, deletePlayersByTeam } from "../api";

interface TeamCardProps {
  team: Team;
  onDelete: (id?: string) => void;
}

const TeamCard: React.FC<TeamCardProps> = ({ team, onDelete }) => {
    const handleDelete = async () => {
    if (confirm(`Delete team "${team.name}"? This will NOT delete players automatically.`)) {
      await deletePlayersByTeam(team.id); 
      await deleteTeam(team.id);
      onDelete(team.id); // Tell parent to remove it from UI
    }
  };
  return (
    <article className="team-card">
      <div className="team-card__header">
        {team.logoUrl && (
          <img
            src={team.logoUrl}
            alt={`${team.name} logo`}
            className="team-card__logo"
            
          />
        )}
        <div>
          <h3 className="team-card__name">{team.name}</h3>
          <div className="team-card__meta">
            {team.city} • Coach: {team.coach}
          </div>
        </div>
      </div>
      <Link to={`/teams/${team.id}`} className="team-card__link">
        View team details
      </Link>
      <button className="delete-btn" onClick={handleDelete}>✕</button>
    </article>
  );
};

export default TeamCard;