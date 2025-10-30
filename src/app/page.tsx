
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
import { ArrowRight, BrainCircuit, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateQuiz } from '@/ai/flows/generate-quiz';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';

const formSchema = z.object({
  topic: z.string().min(2, { message: 'Topic must be at least 2 characters.' }),
  numQuestions: z.coerce.number().int().min(1, 'Please enter at least 1 question.').max(10, 'You can generate a maximum of 10 questions.'),
});

export default function Home() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

      if (quizResult.error) {
        throw new Error(quizResult.error);
      }
      
      if (!quizResult.questions || quizResult.questions.length === 0) {
        throw new Error('The AI failed to generate questions for this topic.');
      }

      sessionStorage.setItem('quizQuestions', JSON.stringify(quizResult.questions));
      const topicData = { name: values.topic, slug: 'custom', difficulty: 'custom' };
      sessionStorage.setItem('quizTopic', JSON.stringify(topicData));
      
      setIsDialogOpen(false);
      router.push('/quiz/custom');

    } catch (error: any) {
      console.error('Failed to generate quiz:', error);
      toast({
        variant: 'destructive',
        title: 'Error Generating Quiz',
        description: error.message || 'There was an issue creating your quiz. Please try again.',
      });
    } finally {
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
          Challenge your knowledge in a futuristic AI-powered quiz arena. Choose a topic or let our AI create a custom quiz for you!
        </p>
        <div className="mt-8 w-full max-w-md flex flex-col sm:flex-row gap-4">
           <Button
              size="lg"
              className="w-full font-bold text-lg"
              onClick={() => router.push('/topics')}
            >
              Start Quiz
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full font-bold text-lg border-2 border-accent text-accent hover:bg-accent/10 hover:text-accent"
                >
                   <BrainCircuit className="mr-2"/> Train Your Mind
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-card/90 backdrop-blur-lg">
                <DialogHeader>
                  <DialogTitle>Train Your Mind with AI</DialogTitle>
                  <DialogDescription>
                    Enter any topic and the number of questions. Our AI will generate a unique quiz just for you.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form 
                    onSubmit={form.handleSubmit(onSubmit)} 
                    className="grid gap-4 py-4"
                  >
                    <FormField
                      control={form.control}
                      name="topic"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quiz Topic</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Ancient Rome, Web Development" {...field} className="text-base"/>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="numQuestions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel># of Questions</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" max="10" {...field} className="text-base"/>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit"
                      className="w-full font-bold text-lg mt-4 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 transform hover:scale-105 shadow-[0_0_15px_rgba(52,209,191,0.6)] hover:shadow-[0_0_25px_rgba(52,209,191,0.9)]"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          Create Quiz <ArrowRight className="ml-2" />
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
        </div>
      </div>
    </div>
  );
}
