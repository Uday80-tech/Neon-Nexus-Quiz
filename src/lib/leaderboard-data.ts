export type LeaderboardEntry = {
  id?: string;
  rank?: number;
  name?: string;
  userId: string;
  score: number;
  avatar?: string;
};

export const leaderboardData: LeaderboardEntry[] = [
  { rank: 1, name: 'CyberNinja', score: 9850, avatar: 'https://api.dicebear.com/8.x/bottts/svg?seed=cyberninja', userId: 'cyberninja' },
  { rank: 2, name: 'Glitch', score: 9500, avatar: 'https://api.dicebear.com/8.x/bottts/svg?seed=glitch', userId: 'glitch' },
  { rank: 3, name: 'DataQueen', score: 9200, avatar: 'https://api.dicebear.com/8.x/bottts/svg?seed=dataqueen', userId: 'dataqueen' },
  { rank: 4, name: 'SynthWave', score: 8800, avatar: 'https://api.dicebear.com/8.x/bottts/svg?seed=synthwave', userId: 'synthwave' },
  { rank: 5, name: 'PixelPioneer', score: 8550, avatar: 'https://api.dicebear.com/8.x/bottts/svg?seed=pixelpioneer', userId: 'pixelpioneer' },
  { rank: 6, name: 'CodeWizard', score: 8230, avatar: 'https://api.dicebear.com/8.x/bottts/svg?seed=codewizard', userId: 'codewizard' },
  { rank: 7, name: 'CircuitBreaker', score: 7900, avatar: 'https://api.dicebear.com/8.x/bottts/svg?seed=circuitbreaker', userId: 'circuitbreaker' },
  { rank: 8, name: 'NeonKnight', score: 7650, avatar: 'https://api.dicebear.com/8.x/bottts/svg?seed=neonknight', userId: 'neonknight' },
  { rank: 9, name: 'LogicLord', score: 7400, avatar: 'https://api.dicebear.com/8.x/bottts/svg?seed=logiclord', userId: 'logiclord' },
  { rank: 10, name: 'BinaryBard', score: 7120, avatar: 'https://api.dicebear.com/8.x/bottts/svg?seed=binarybard', userId: 'binarybard' },
];
