'use server';
/**
 * @fileOverview This file defines a Genkit flow to suggest a personalized training plan.
 *
 * - suggestPersonalizedTrainingPlan - An async function that takes a topic and difficulty and returns a quiz and learning resources.
 * - SuggestPersonalizedTrainingPlanInput - The input type for the suggestPersonalizedTrainingPlan function.
 * - SuggestPersonalizedTrainingPlanOutput - The output type for the suggestPersonalizedTrainingPlan function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SuggestPersonalizedTrainingPlanInputSchema = z.object({
  topic: z.string().describe('The topic for the quiz.'),
  numberOfQuestions: z.number().int().positive().describe('The number of questions to generate for the quiz.'),
  difficulty: z.enum(['easy', 'medium', 'hard']).describe('The difficulty level of the quiz (beginner, intermediate, or expert).'),
});
export type SuggestPersonalizedTrainingPlanInput = z.infer<typeof SuggestPersonalizedTrainingPlanInputSchema>;

const SuggestPersonalizedTrainingPlanOutputSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string(),
      options: z.array(z.string()).length(4),
      correctAnswer: z.number().int().min(0).max(3),
      difficulty: z.enum(['easy', 'medium', 'hard']),
    })
  ).optional(),
  suggestedResources: z.array(
    z.object({
      resourceName: z.string(),
      resourceLink: z.string(),
      reason: z.string(),
    })
  ).optional(),
  error: z.string().optional(),
});
export type SuggestPersonalizedTrainingPlanOutput = z.infer<typeof SuggestPersonalizedTrainingPlanOutputSchema>;

export async function suggestPersonalizedTrainingPlan(input: SuggestPersonalizedTrainingPlanInput): Promise<SuggestPersonalizedTrainingPlanOutput> {
  return suggestPersonalizedTrainingPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestPersonalizedTrainingPlanPrompt',
  input: { schema: SuggestPersonalizedTrainingPlanInputSchema },
  output: { schema: SuggestPersonalizedTrainingPlanOutputSchema },
  prompt: `You are an AI learning assistant. Generate a quiz with {{numberOfQuestions}} questions about the topic: "{{topic}}".
The questions should be of "{{difficulty}}" difficulty.
Each question must have exactly 4 options.
The 'correctAnswer' field must be the index (0-3) of the correct option in the 'options' array.
Set the 'difficulty' field for each question to be "{{difficulty}}".

In addition, provide a list of 2-3 suggested learning resources for the given topic and difficulty level. These resources should be real, publicly accessible links. For each resource, provide a name, a valid URL, and a brief reason for the recommendation.
`,
});

const suggestPersonalizedTrainingPlanFlow = ai.defineFlow(
  {
    name: 'suggestPersonalizedTrainingPlanFlow',
    inputSchema: SuggestPersonalizedTrainingPlanInputSchema,
    outputSchema: SuggestPersonalizedTrainingPlanOutputSchema,
  },
  async input => {
    try {
      const { output } = await prompt(input);
      return output!;
    } catch (e: any) {
      if (e.message.includes('503')) {
        return { error: 'The AI model is currently overloaded. Please try again in a few moments.' };
      }
      console.error(e);
      return { error: 'An unexpected error occurred while generating the training plan.' };
    }
  }
);
