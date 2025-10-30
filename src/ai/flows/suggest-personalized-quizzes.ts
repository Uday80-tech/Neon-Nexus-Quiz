'use server';

/**
 * @fileOverview This file defines a Genkit flow to suggest personalized quizzes based on a user's quiz history and performance.
 *
 * - suggestPersonalizedQuizzes - An async function that takes a user's quiz history and returns a list of suggested quizzes.
 * - SuggestPersonalizedQuizzesInput - The input type for the suggestPersonalizedQuizzes function.
 * - SuggestPersonalizedQuizzesOutput - The output type for the suggestPersonalizedQuizzes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestPersonalizedQuizzesInputSchema = z.object({
  quizHistory: z.array(
    z.object({
      topic: z.string(),
      score: z.number(),
      questionsAnswered: z.number(),
      totalQuestions: z.number(),
    })
  ).describe('A list of the user\'s quiz history, including topic, score, questions answered, and total questions.'),
  topics: z.array(z.string()).optional().describe('The set of topics available for taking quizzes.'),
});
export type SuggestPersonalizedQuizzesInput = z.infer<typeof SuggestPersonalizedQuizzesInputSchema>;

const SuggestPersonalizedQuizzesOutputSchema = z.object({
  suggestedQuizzes: z.array(
    z.object({
      topic: z.string(),
      reason: z.string(),
    })
  ).describe('A list of suggested quizzes, including topic and reason for suggestion.'),
});
export type SuggestPersonalizedQuizzesOutput = z.infer<typeof SuggestPersonalizedQuizzesOutputSchema>;

export async function suggestPersonalizedQuizzes(input: SuggestPersonalizedQuizzesInput): Promise<SuggestPersonalizedQuizzesOutput> {
  return suggestPersonalizedQuizzesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestPersonalizedQuizzesPrompt',
  input: {schema: SuggestPersonalizedQuizzesInputSchema},
  output: {schema: SuggestPersonalizedQuizzesOutputSchema},
  prompt: `You are an AI quiz recommender. You will take a user\'s quiz history and return a list of suggested quizzes tailored to their needs, focusing on areas where they need improvement.\n\nConsider the user\'s quiz history and overall topics to provide personalized recommendations.\n\nQuiz History:\n{{#each quizHistory}}
- Topic: {{topic}}, Score: {{score}}, Questions Answered: {{questionsAnswered}}, Total Questions: {{totalQuestions}}\n{{/each}}
\nAvailable Topics: {{topics}}
\nBased on this information, suggest quizzes on topics where the user has performed poorly. Suggest only topics from the available topics.\n`,
});

const suggestPersonalizedQuizzesFlow = ai.defineFlow(
  {
    name: 'suggestPersonalizedQuizzesFlow',
    inputSchema: SuggestPersonalizedQuizzesInputSchema,
    outputSchema: SuggestPersonalizedQuizzesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
