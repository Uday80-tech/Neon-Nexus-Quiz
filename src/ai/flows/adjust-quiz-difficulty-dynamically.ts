'use server';
/**
 * @fileOverview Adjusts the quiz difficulty dynamically based on user performance.
 *
 * - adjustQuizDifficulty - A function that adjusts the quiz difficulty based on user performance.
 * - AdjustQuizDifficultyInput - The input type for the adjustQuizDifficulty function.
 * - AdjustQuizDifficultyOutput - The return type for the adjustQuizdifficulty function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdjustQuizDifficultyInputSchema = z.object({
  userPerformance: z
    .number()
    .describe(
      'The user performance score, represented as a percentage (e.g., 0.75 for 75%).'
    ),
  currentDifficulty: z
    .enum(['easy', 'medium', 'hard'])
    .describe('The current difficulty level of the quiz.'),
});
export type AdjustQuizDifficultyInput = z.infer<typeof AdjustQuizDifficultyInputSchema>;

const AdjustQuizDifficultyOutputSchema = z.object({
  suggestedDifficulty: z
    .enum(['easy', 'medium', 'hard'])
    .describe('The suggested difficulty level for the next quiz.').optional(),
  reason: z
    .string()
    .describe(
      'The reasoning behind the suggested difficulty level adjustment.'
    ).optional(),
  error: z.string().optional(),
});
export type AdjustQuizDifficultyOutput = z.infer<typeof AdjustQuizDifficultyOutputSchema>;

export async function adjustQuizDifficulty(
  input: AdjustQuizDifficultyInput
): Promise<AdjustQuizDifficultyOutput> {
  return adjustQuizDifficultyFlow(input);
}

const adjustQuizDifficultyPrompt = ai.definePrompt({
  name: 'adjustQuizDifficultyPrompt',
  input: {schema: AdjustQuizDifficultyInputSchema},
  output: {schema: AdjustQuizDifficultyOutputSchema},
  prompt: `You are an AI quiz master. A player has just finished a quiz with a performance score of {{userPerformance}}, and the quiz was of {{currentDifficulty}} difficulty. Your job is to adjust the difficulty for the next quiz, keeping in mind that the player should always be challenged but not overwhelmed.

  Based on the player's performance, suggest a new difficulty level, which must be one of "easy", "medium", or "hard". You should also provide a short explanation for your decision in the "reason" field. Return the result in JSON format.
  `,
});

const adjustQuizDifficultyFlow = ai.defineFlow(
  {
    name: 'adjustQuizDifficultyFlow',
    inputSchema: AdjustQuizDifficultyInputSchema,
    outputSchema: AdjustQuizDifficultyOutputSchema,
  },
  async input => {
    try {
      const {output} = await adjustQuizDifficultyPrompt(input);
      return output!;
    } catch (e: any) {
      if (e.message.includes('503')) {
        return { error: 'The AI model is currently overloaded. Please try again in a few moments.' };
      }
      console.error(e);
      return { error: 'An unexpected error occurred while adjusting difficulty.' };
    }
  }
);
