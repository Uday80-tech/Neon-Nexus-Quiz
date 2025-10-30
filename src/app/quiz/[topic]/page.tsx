import { questions, topics } from '@/lib/quiz-data';
import QuizClient from '@/components/quiz/QuizClient';
import { notFound } from 'next/navigation';
import type { Question } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export async function generateStaticParams() {
  return topics.map((topic) => ({
    topic: topic.slug,
  }));
}

export default function QuizPage({ params }: { params: { topic: string } }) {
  const topicData = topics.find((t) => t.slug === params.topic);
  const quizQuestions: Question[] | undefined = questions[params.topic];

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
             <Link href="/topics">
              <Button>Choose Another Topic</Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  return <QuizClient questions={quizQuestions} topic={topicData} />;
}
