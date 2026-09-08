export interface Team {
  id?: string;
  name: string;
  city: string;
  coach: string;
  logoUrl?: string;
}

export interface Player {
  id?: string;
  name: string;
  position: string;
  number: number;
  teamId: string;
}
