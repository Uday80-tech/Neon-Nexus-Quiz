import { BrainCircuit, Code, Cpu, FlaskConical } from 'lucide-react';
import type { Topic, Question } from './types';

export const topics: Topic[] = [
  {
    slug: 'science',
    name: 'Science',
    description: 'Test your knowledge of the natural and physical world.',
    icon: FlaskConical,
    difficulty: 'easy',
  },
  {
    slug: 'technology',
    name: 'Technology',
    description: 'From gadgets to the web, how well do you know tech?',
    icon: Cpu,
    difficulty: 'medium',
  },
  {
    slug: 'ai',
    name: 'Artificial Intelligence',
    description: 'Explore the cutting-edge world of AI and machine learning.',
    icon: BrainCircuit,
    difficulty: 'hard',
  },
  {
    slug: 'python',
    name: 'Python',
    description: 'How sharp are your Python programming skills?',
    icon: Code,
    difficulty: 'medium',
  },
];

export const questions: Record<string, Question[]> = {
  science: [
    {
      question: 'What is the chemical symbol for water?',
      options: ['O2', 'H2O', 'CO2', 'NaCl'],
      correctAnswer: 1,
      difficulty: 'easy',
    },
    {
      question: 'Which planet is known as the Red Planet?',
      options: ['Earth', 'Mars', 'Jupiter', 'Venus'],
      correctAnswer: 1,
      difficulty: 'easy',
    },
    {
      question: 'What is the powerhouse of the cell?',
      options: ['Nucleus', 'Ribosome', 'Mitochondrion', 'Chloroplast'],
      correctAnswer: 2,
      difficulty: 'easy',
    },
  ],
  technology: [
    {
      question: 'What does "CPU" stand for?',
      options: [
        'Central Processing Unit',
        'Computer Personal Unit',
        'Central Processor Unit',
        'Control Processing Unit',
      ],
      correctAnswer: 0,
      difficulty: 'medium',
    },
    {
      question: 'Which company developed the first commercially successful personal computer?',
      options: ['IBM', 'Microsoft', 'Apple', 'Commodore'],
      correctAnswer: 2,
      difficulty: 'medium',
    },
    {
      question: 'What does "HTTP" stand for?',
      options: [
        'HyperText Transfer Protocol',
        'Hyperlink Text Transfer Protocol',
        'High-Level Text Transfer Protocol',
        'HyperText Transit Protocol',
      ],
      correctAnswer: 0,
      difficulty: 'medium',
    },
  ],
  ai: [
    {
      question: 'Who is considered the "father of Artificial Intelligence"?',
      options: ['Alan Turing', 'John McCarthy', 'Geoffrey Hinton', 'Marvin Minsky'],
      correctAnswer: 1,
      difficulty: 'hard',
    },
    {
      question: 'What is a "neural network" in the context of AI?',
      options: [
        'A network of biological neurons',
        'A computer system modeled on the human brain and nervous system',
        'A type of computer virus',
        'A social network for AI developers',
      ],
      correctAnswer: 1,
      difficulty: 'hard',
    },
    {
      question: 'What does the Turing Test evaluate?',
      options: [
        "A machine's processing speed",
        "A machine's ability to exhibit intelligent behavior equivalent to, or indistinguishable from, that of a human",
        "A machine's ability to play chess",
        "A machine's memory capacity",
      ],
      correctAnswer: 1,
      difficulty: 'hard',
    },
  ],
  python: [
    {
      question: 'What is the correct file extension for Python files?',
      options: ['.pyth', '.pt', '.py', '.p'],
      correctAnswer: 2,
      difficulty: 'easy',
    },
    {
      question: 'How do you insert a comment in a Python script?',
      options: ['// This is a comment', '/* This is a comment */', '# This is a comment', '-- This is a comment'],
      correctAnswer: 2,
      difficulty: 'easy',
    },
    {
      question: 'Which of the following data types is NOT a built-in type in Python?',
      options: ['dict', 'list', 'tuple', 'tree'],
      correctAnswer: 3,
      difficulty: 'medium',
    },
  ],
};
