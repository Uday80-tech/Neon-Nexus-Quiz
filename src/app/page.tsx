
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ThreeScene from '@/components/ThreeScene';
import { ArrowRight, BrainCircuit, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateQuiz } from '@/ai/flows/generate-quiz';
import { suggestPersonalizedTrainingPlan } from '@/ai/flows/suggest-personalized-training-plan';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';

const formSchema = z.object({
  topic: z.string().min(2, { message: 'Topic must be at least 2 characters.' }),
  numQuestions: z.coerce.number().int().min(1, 'Please enter at least 1 question.').max(100, 'You can generate a maximum of 100 questions.'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
});

function HomePageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isQuizDialogOpen, setIsQuizDialogOpen] = useState(false);
  const [isTrainingDialogOpen, setIsTrainingDialogOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get('action') === 'start_quiz') {
      setIsQuizDialogOpen(true);
    }
  }, [searchParams]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
      numQuestions: 5,
      difficulty: 'medium',
    },
  });

  const trainingForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
      numQuestions: 3,
      difficulty: 'easy',
    },
  });

  async function onQuizSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const quizResult = await generateQuiz({
        topic: values.topic,
        numberOfQuestions: values.numQuestions,
        difficulty: values.difficulty,
      });

      if (quizResult.error) {
        toast({
          variant: 'destructive',
          title: 'Error Generating Quiz',
          description: quizResult.error,
        });
        return;
      }
      
      if (!quizResult.questions || quizResult.questions.length === 0) {
        throw new Error('The AI failed to generate questions for this topic.');
      }

      sessionStorage.setItem('quizQuestions', JSON.stringify(quizResult.questions));
      const topicData = { name: values.topic, slug: 'custom', difficulty: values.difficulty };
      sessionStorage.setItem('quizTopic', JSON.stringify(topicData));
      
      setIsQuizDialogOpen(false);
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
  
  async function onTrainingSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const trainingResult = await suggestPersonalizedTrainingPlan({
        topic: values.topic,
        numberOfQuestions: values.numQuestions,
        difficulty: values.difficulty,
      });

      if (trainingResult.error) {
        toast({
          variant: 'destructive',
          title: 'Error Generating Training Plan',
          description: trainingResult.error,
        });
        return;
      }
      
      if (!trainingResult.questions || trainingResult.questions.length === 0) {
        throw new Error('The AI failed to generate a training plan for this topic.');
      }

      sessionStorage.setItem('quizQuestions', JSON.stringify(trainingResult.questions));
      const topicData = { name: `Training: ${values.topic}`, slug: 'custom-training', difficulty: values.difficulty };
      sessionStorage.setItem('quizTopic', JSON.stringify(topicData));
      
      if(trainingResult.suggestedResources && trainingResult.suggestedResources.length > 0) {
        sessionStorage.setItem('learningResources', JSON.stringify(trainingResult.suggestedResources));
      }
      
      setIsTrainingDialogOpen(false);
      router.push('/quiz/custom-training');

    } catch (error: any) {
      console.error('Failed to generate training plan:', error);
      toast({
        variant: 'destructive',
        title: 'Error Generating Training Plan',
        description: error.message || 'There was an issue creating your training plan. Please try again.',
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
            <Dialog open={isQuizDialogOpen} onOpenChange={setIsQuizDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="w-full font-bold text-lg"
                >
                   Start Quiz
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-card/90 backdrop-blur-lg">
                <DialogHeader>
                  <DialogTitle>Create Your Own Quiz</DialogTitle>
                  <DialogDescription>
                    Enter any topic and the number of questions. Our AI will generate a unique quiz just for you.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form 
                    onSubmit={form.handleSubmit(onQuizSubmit)} 
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
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="numQuestions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel># of Questions</FormLabel>
                            <FormControl>
                              <Input type="number" min="1" max="100" {...field} className="text-base"/>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="difficulty"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Difficulty</FormLabel>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="text-base">
                                  <SelectValue placeholder="Select difficulty" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="easy">Easy</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="hard">Hard</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
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
            <Dialog open={isTrainingDialogOpen} onOpenChange={setIsTrainingDialogOpen}>
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
                  <DialogTitle>AI Training Plan</DialogTitle>
                  <DialogDescription>
                    Our AI will generate a short quiz and personalized learning resources to help you master a new topic.
                  </DialogDescription>
                </DialogHeader>
                <Form {...trainingForm}>
                  <form 
                    onSubmit={trainingForm.handleSubmit(onTrainingSubmit)} 
                    className="grid gap-4 py-4"
                  >
                    <FormField
                      control={trainingForm.control}
                      name="topic"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Training Topic</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Quantum Physics" {...field} className="text-base"/>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={trainingForm.control}
                        name="numQuestions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel># of Questions</FormLabel>
                            <FormControl>
                              <Input type="number" min="1" max="100" {...field} className="text-base"/>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={trainingForm.control}
                        name="difficulty"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Difficulty</FormLabel>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="text-base">
                                  <SelectValue placeholder="Select difficulty" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="easy">Easy</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="hard">Hard</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button 
                      type="submit"
                      className="w-full font-bold text-lg mt-4 bg-accent text-accent-foreground hover:bg-accent/90 transition-all duration-300 transform hover:scale-105 shadow-[0_0_15px_rgba(157,93,249,0.6)] hover:shadow-[0_0_25px_rgba(157,93,249,0.9)]"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 animate-spin" />
                          Generating Plan...
                        </>
                      ) : (
                        <>
                          Start Training <ArrowRight className="ml-2" />
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


export default function Home() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
      <HomePageClient />
    </Suspense>
  );
}
