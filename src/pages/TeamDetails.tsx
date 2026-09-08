import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Team, Player } from "../types";
import { getTeamById, getPlayersByTeam, createPlayer } from "../api";
import PlayerComponent from "../components/Player";
import Warning from "../components/Warning";
import Info from "../components/Info";

const TeamDetails: React.FC = () => {
  const { id: teamId } = useParams();  
  const [team, setTeam] = useState<Team | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerCount, setPlayerCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Form
  const [playerName, setPlayerName] = useState("");
  const [position, setPosition] = useState("Goalkeeper");
  const [number, setNumber] = useState("");

  useEffect(() => {
    if (!teamId) return;

    const fetchTeam = async () => {
      try {
        const response = await getTeamById(teamId);
        setTeam(response.data);
      } catch {
        setError("Team not found");
      }
    };

    fetchTeam();
  }, [teamId]);

  useEffect(() => {
    if (!teamId) return;

    const fetchPlayers = async () => {
      try {
        const response = await getPlayersByTeam(teamId); // teamId string OK
        setPlayers(response.data);
      } catch {
        setError("Error loading players");
      }
    };

    fetchPlayers();
  }, [teamId]);

  useEffect(() => {
    setPlayerCount(players.length);
  }, [players]);

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!teamId) return;

    const newPlayer: Player = {
      id: String(Date.now()),   // string
      name: playerName,
      position,
      number: Number(number),
      teamId: teamId            // string
    };

    try {
      const response = await createPlayer(newPlayer);
      setPlayers(prev => [...prev, response.data]);

      setPlayerName("");
      setPosition("Goalkeeper");
      setNumber("");
    } catch {
      setError("Error adding player");
    }
  };

  const handleDeletePlayer = (id?: string) => {
    setPlayers(prev => prev.filter(p => p.id !== id));
  };

  if (error) return <p style={{color:"red"}}>{error}</p>;
  if (!team) return <p>Loading...</p>;

  return (
    <section>
      <div className="body__header">
        <div>
          <h1>{team.name}</h1>
          <p>{team.city} • Coach: {team.coach}</p>
          <Link to="/">← Back</Link>
        </div>
        <img
          src={team.logoUrl}
          width={80}
          height={80}
          onError={e => e.currentTarget.src = "https://via.placeholder.com/80"}
        />
      </div>

      {playerCount < 11 ? (
        <Warning playerCount={playerCount} />
      ) : (
        <Info playerCount={playerCount} />
      )}

      <h2>Players</h2>

      <div className="player-list">
        {players.map(p => (
          <PlayerComponent key={p.id} player={p} onDelete={handleDeletePlayer}  />
        ))}
      </div>

      <form className="form" onSubmit={handleAddPlayer}>
        <h2>Add player</h2>

        <div className="form__row">
          <label>Name</label>
          <input value={playerName} onChange={e => setPlayerName(e.target.value)} required />
        </div>

        <div className="form__row">
          <label>Position</label>
          <select 
            value={position}
            onChange={e => setPosition(e.target.value)}
            
            required
          >
            <option>Goalkeeper</option>
            <option>Denfender</option>
            <option>Midfielder</option>
            <option>Forward</option>
        </select>
        </div>

        <div className="form__row">
          <label>Number</label>
          <input
            type="number"
            value={number}
            onChange={e => setNumber(e.target.value)}
            required
          />
        </div>

        <button className="button button--primary">Add player</button>
      </form>
    </section>
  );
};

export default TeamDetails;