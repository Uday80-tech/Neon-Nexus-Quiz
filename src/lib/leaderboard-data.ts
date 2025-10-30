
export type LeaderboardEntry = {
  id: string;
  userId: string;
  totalScore: number;
  lastPlayed: {
    seconds: number;
    nanoseconds: number;
  };
};

    