import type { LucideIcon } from "lucide-react";

export type Question = {
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'easy' | 'medium' | 'hard';
};

export type Topic = {
  slug: string;
  name: string;
  description: string;
  icon: LucideIcon;
  difficulty: 'easy' | 'medium' | 'hard';
};
