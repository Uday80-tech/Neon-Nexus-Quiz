
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import ThreeScene from '@/components/ThreeScene';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateQuiz } from '@/ai/flows/generate-quiz';

const formSchema = z.object({
  topic: z.string().min(2, { message: 'Topic must be at least 2 characters.' }),
  numQuestions: z.coerce.number().int().min(1, 'Please enter at least 1 question.').max(10, 'You can generate a maximum of 10 questions.'),
});

export default function Home() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: 'General Knowledge',
      numQuestions: 5,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const quizResult = await generateQuiz({
        topic: values.topic,
        numberOfQuestions: values.numQuestions,
      });

      // Store questions and topic in session storage to pass to the quiz page
      sessionStorage.setItem('quizQuestions', JSON.stringify(quizResult.questions));
      sessionStorage.setItem('quizTopic', JSON.stringify({ name: values.topic, slug: 'custom', difficulty: 'custom' }));
      
      router.push('/quiz/custom');

    } catch (error) {
      console.error('Failed to generate quiz:', error);
      toast({
        variant: 'destructive',
        title: 'Error Generating Quiz',
        description: 'There was an issue creating your quiz. Please try again.',
      });
      setIsLoading(false);
    }
  }

  return (
    <div className="relative flex-1 flex items-center justify-center overflow-hidden">
      <ThreeScene />
      <div className="relative z-10 flex flex-col items-center text-center p-4">
        <h1 
          className="text-5xl md:text-7xl lg:text-8xl font-bold text-primary"
          style={{ textShadow: '0 0 10px hsl(var(--primary)), 0 0 20px hsl(var(--primary)), 0 0 40px hsl(var(--primary))' }}
        >
          Neon Nexus Quiz
        </h1>
        <p className="mt-4 max-w-2xl text-lg md:text-xl text-foreground/80">
          Challenge your knowledge in a futuristic AI-powered quiz arena. Enter any topic and let our AI create a custom quiz for you!
        </p>
        <Form {...form}>
          <form 
            onSubmit={form.handleSubmit(onSubmit)} 
            className="mt-8 w-full max-w-lg grid grid-cols-1 md:grid-cols-2 gap-4 items-start bg-card/50 backdrop-blur-sm p-6 rounded-lg border"
          >
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <FormField
                  control={form.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem className="text-left">
                      <FormLabel>Quiz Topic</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Ancient Rome, Web Development" {...field} className="text-base"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div>
                <FormField
                  control={form.control}
                  name="numQuestions"
                  render={({ field }) => (
                    <FormItem className="text-left">
                      <FormLabel># of Questions</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="10" {...field} className="text-base"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <Button 
                type="submit"
                size="lg" 
                className="w-full font-bold text-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 transform hover:scale-105 shadow-[0_0_15px_rgba(52,209,191,0.6)] hover:shadow-[0_0_25px_rgba(52,209,191,0.9)]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 animate-spin" />
                    Generating Quiz...
                  </>
                ) : (
                  <>
                    Start Quiz <ArrowRight className="ml-2" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
