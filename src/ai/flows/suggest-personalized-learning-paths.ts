'use server';

/**
 * @fileOverview This file defines a Genkit flow to suggest personalized learning paths based on a user's quiz history and performance.
 *
 * - suggestPersonalizedLearningPaths - An async function that takes a user's quiz history and performance data and returns a list of suggested learning resources.
 * - SuggestPersonalizedLearningPathsInput - The input type for the suggestPersonalizedLearningPaths function.
 * - SuggestPersonalizedLearningPathsOutput - The output type for the suggestPersonalizedLearningPaths function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestPersonalizedLearningPathsInputSchema = z.object({
  quizHistory: z.array(
    z.object({
      topic: z.string(),
      score: z.number(),
      questionsAnswered: z.number(),
      totalQuestions: z.number(),
    })
  ).describe('A list of the user\'s quiz history, including topic, score, questions answered, and total questions.'),
  preferredLearningStyle: z.string().optional().describe('The user\'s preferred learning style (e.g., visual, auditory, kinesthetic).'),
  topics: z.array(z.string()).optional().describe('The set of topics available for taking quizzes.'),
});
export type SuggestPersonalizedLearningPathsInput = z.infer<typeof SuggestPersonalizedLearningPathsInputSchema>;

const SuggestPersonalizedLearningPathsOutputSchema = z.object({
  suggestedResources: z.array(
    z.object({
      topic: z.string(),
      resourceName: z.string(),
      resourceLink: z.string(),
      reason: z.string(),
    })
  ).describe('A list of suggested learning resources, including topic, name, link, and reason for suggestion.'),
});
export type SuggestPersonalizedLearningPathsOutput = z.infer<typeof SuggestPersonalizedLearningPathsOutputSchema>;

export async function suggestPersonalizedLearningPaths(input: SuggestPersonalizedLearningPathsInput): Promise<SuggestPersonalizedLearningPathsOutput> {
  return suggestPersonalizedLearningPathsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestPersonalizedLearningPathsPrompt',
  input: {schema: SuggestPersonalizedLearningPathsInputSchema},
  output: {schema: SuggestPersonalizedLearningPathsOutputSchema},
  prompt: `You are an AI learning resource recommender. You will take a user's quiz history and performance data and return a list of suggested learning resources tailored to their needs.

Consider the user's quiz history, preferred learning style (if available), and overall topics to provide personalized recommendations.

Quiz History:
{{#each quizHistory}}
- Topic: {{topic}}, Score: {{score}}, Questions Answered: {{questionsAnswered}}, Total Questions: {{totalQuestions}}
{{/each}}

Preferred Learning Style: {{preferredLearningStyle}}

Available Topics: {{topics}}

Based on this information, suggest relevant and helpful learning resources.
`,
});

const suggestPersonalizedLearningPathsFlow = ai.defineFlow(
  {
    name: 'suggestPersonalizedLearningPathsFlow',
    inputSchema: SuggestPersonalizedLearningPathsInputSchema,
    outputSchema: SuggestPersonalizedLearningPathsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
