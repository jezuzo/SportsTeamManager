import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3001"
});

// Teams
export const getTeams = () => api.get("/teams");
export const getTeamById = (id: string) => api.get(`/teams/${id}`);

export const deleteTeam = (id?: string) => api.delete(`/teams/${id}`);
export const deletePlayer = (id?: string) => api.delete(`/players/${id}`);

export const deletePlayersByTeam = async (teamId?: string) => {
  const res = await api.get(`/players?teamId=${teamId}`);
  const players = res.data;

  // Delete each player individually
  for (const player of players) {
    await api.delete(`/players/${player.id}`);
  }
};

export const createTeam = (team: Omit<import("./types").Team, "id">) =>
  api.post("/teams", team);

// Players
export const getPlayersByTeam = (teamId: string) =>
  api.get("/players", { params: { teamId } });

export const createPlayer = (player: Omit<import("./types").Player, "id">) =>
  api.post("/players", player);