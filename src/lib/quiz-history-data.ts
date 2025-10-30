export type QuizHistoryEntry = {
  topic: string;
  score: number; // as a percentage
  totalQuestions: number;
  date: string; // YYYY-MM-DD
};

export const quizHistoryData: QuizHistoryEntry[] = [
  {
    topic: 'Science',
    score: 67,
    totalQuestions: 3,
    date: '2024-07-25',
  },
  {
    topic: 'Technology',
    score: 100,
    totalQuestions: 3,
    date: '2024-07-23',
  },
  {
    topic: 'Python',
    score: 33,
    totalQuestions: 3,
    date: '2024-07-22',
  },
    {
    topic: 'Artificial Intelligence',
    score: 100,
    totalQuestions: 3,
    date: '2024-07-20',
  },
];
