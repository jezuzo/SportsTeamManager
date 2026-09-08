import React, { useEffect, useState } from "react";
import { Team } from "../types";
import { getTeams, createTeam } from "../api";
import TeamCard from "../components/TeamCard";

const TeamList: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [coach, setCoach] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const response = await getTeams();
        setTeams(response.data);
      } catch (err) {
        setError("Error loading teams");
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();

    const newTeam: Team = {
      id: String(Date.now()), // ID string
      name,
      city,
      coach,
      logoUrl: logoUrl || "https://via.placeholder.com/80"
    };

    try {
      const response = await createTeam(newTeam);
      setTeams(prev => [...prev, response.data]);

      setName("");
      setCity("");
      setCoach("");
      setLogoUrl("");
    } catch (err) {
      setError("Error creating team");
    }
  };

  const handleDeleteTeam = (id?: string) => {
    setTeams(prev => prev.filter(t => t.id !== id));
    
  };

  return (
    <section className="team-list">
      <h1>Teams</h1>

      {loading && <p>Loading...</p>}
      {error && <p style={{color:"red"}}>{error}</p>}

      <div className="team-list__grid">
        {teams.map(team => (
          <TeamCard key={team.id} team={team} onDelete={handleDeleteTeam} />
        ))}
      </div>

      <form className="form" onSubmit={handleCreateTeam}>
        <h2>Create new team</h2>

        <div className="form__row">
          <label>Name</label>
          <input value={name} onChange={e => setName(e.target.value)} required />
        </div>

        <div className="form__row">
          <label>City</label>
          <input value={city} onChange={e => setCity(e.target.value)} required />
        </div>

        <div className="form__row">
          <label>Coach</label>
          <input value={coach} onChange={e => setCoach(e.target.value)} required />
        </div>

        <div className="form__row">
          <label>Logo</label>
          <input value={logoUrl} onChange={e => setLogoUrl(e.target.value)} />
        </div>

        <button className="button button--primary">Add Team</button>
      </form>
    </section>
  );
};

export default TeamList;
