
'use server';

/**
 * @fileOverview This file defines a Genkit flow to generate a quiz on a given topic.
 *
 * - generateQuiz - An async function that takes a topic and number of questions and returns a quiz.
 * - GenerateQuizInput - The input type for the generateQuiz function.
 * - GenerateQuizOutput - The output type for the generateQuiz function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateQuizInputSchema = z.object({
  topic: z.string().describe('The topic for the quiz.'),
  numberOfQuestions: z.number().int().positive().describe('The number of questions to generate for the quiz.'),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

const GenerateQuizOutputSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string(),
      options: z.array(z.string()).length(4),
      correctAnswer: z.number().int().min(0).max(3),
      difficulty: z.enum(['easy', 'medium', 'hard']),
    })
  ),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;

export async function generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
  return generateQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizPrompt',
  input: { schema: GenerateQuizInputSchema },
  output: { schema: GenerateQuizOutputSchema },
  prompt: `You are a quiz generation AI. Generate a quiz with {{numberOfQuestions}} questions about the topic: "{{topic}}".
Each question must have exactly 4 options.
The 'correctAnswer' field must be the index (0-3) of the correct option in the 'options' array.
Determine a suitable difficulty ('easy', 'medium', or 'hard') for each question based on the topic and question complexity.
`,
});

const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
