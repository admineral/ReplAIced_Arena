export interface UserRank {
  id: string;
  displayName: string;
  photoURL: string;
  level: number;
  experience: number;
  rank: number;
  streak: number;
  contributions: number;
  attacksLaunched: number;
  defensesSuccessful: number;
}

export interface Activity {
  type: 'attack' | 'defense' | 'contribution';
  timestamp: number;
  details: string;
}
