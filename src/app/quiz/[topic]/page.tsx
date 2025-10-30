
'use client';

import { questions, topics } from '@/lib/quiz-data';
import QuizClient from '@/components/quiz/QuizClient';
import { notFound, useRouter } from 'next/navigation';
import type { Question } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export default function QuizPage({ params }: { params: { topic: string } }) {
  const [quizQuestions, setQuizQuestions] = useState<Question[] | null>(null);
  const [topicData, setTopicData] = useState<Omit<import('@/lib/types').Topic, 'icon'> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    const currentTopic = params.topic;

    if (currentTopic) {
      if (currentTopic === 'custom' || currentTopic === 'custom-training') {
        const storedQuestions = sessionStorage.getItem('quizQuestions');
        const storedTopic = sessionStorage.getItem('quizTopic');
        
        if (storedQuestions && storedTopic) {
          try {
            setQuizQuestions(JSON.parse(storedQuestions));
            setTopicData(JSON.parse(storedTopic));
          } catch (e) {
            console.error("Failed to parse session storage data", e);
            router.push('/');
            return;
          }
        } else {
          // If no data, redirect to home to create a new quiz
          router.push('/');
          return;
        }
      } else {
        const staticTopicData = topics.find((t) => t.slug === currentTopic);
        if (staticTopicData) {
          const { icon, ...serializableTopicData } = staticTopicData;
          setTopicData(serializableTopicData);
          setQuizQuestions(questions[currentTopic] || []);
        }
      }
      setIsLoading(false);
    }
  }, [params.topic, router]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!quizQuestions || !topicData) {
    notFound();
  }

  if (quizQuestions.length === 0) {
    return (
       <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <Card className="max-w-md">
          <CardHeader>
             <div className="mx-auto bg-destructive/10 p-3 rounded-full mb-4">
               <AlertTriangle className="h-10 w-10 text-destructive" />
             </div>
            <CardTitle className="text-2xl">No Questions Available</CardTitle>
            <CardDescription>
              We're sorry, but there are no questions available for the "{topicData.name}" topic at the moment.
            </CardDescription>
          </CardHeader>
          <div className="p-6 pt-0">
             <Link href="/">
              <Button>Create a new Quiz</Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  return <QuizClient questions={quizQuestions} topic={topicData} />;
}
