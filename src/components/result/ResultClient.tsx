"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import useWindowSize from 'react-use/lib/useWindowSize';
import Confetti from 'react-confetti';
import Link from 'next/link';

import { adjustQuizDifficulty, AdjustQuizDifficultyOutput } from '@/ai/flows/adjust-quiz-difficulty-dynamically';
import { suggestPersonalizedLearningPaths, SuggestPersonalizedLearningPathsOutput } from '@/ai/flows/suggest-personalized-learning-paths';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit, Home, Link as LinkIcon, Loader2, RefreshCw, Sparkles, Target } from 'lucide-react';
import type { SuggestPersonalizedLearningPathsOutput as LearningResources } from '@/ai/flows/suggest-personalized-learning-paths';


export default function ResultClient() {
  const searchParams = useSearchParams();
  const { width, height } = useWindowSize();

  const score = parseInt(searchParams.get('score') || '0', 10);
  const total = parseInt(searchParams.get('total') || '0', 10);
  const topic = searchParams.get('topic') || '';
  const difficulty = searchParams.get('difficulty') || 'medium' as 'easy' | 'medium' | 'hard';
  
  const [showConfetti, setShowConfetti] = useState(true);
  const [aiDifficulty, setAiDifficulty] = useState<AdjustQuizDifficultyOutput | null>(null);
  const [aiLearningPath, setAiLearningPath] = useState<SuggestPersonalizedLearningPathsOutput | null>(null);
  const [sessionLearningResources, setSessionLearningResources] = useState<LearningResources['suggestedResources'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const performance = useMemo(() => (total > 0 ? score / total : 0), [score, total]);
  
  useEffect(() => {
    // Clear learning resources from previous sessions
    if (topic !== 'custom-training') {
      sessionStorage.removeItem('learningResources');
    } else {
      const resources = sessionStorage.getItem('learningResources');
      if (resources) {
        setSessionLearningResources(JSON.parse(resources));
      }
    }
  
    if (total > 0) {
      const getAiFeedback = async () => {
        setIsLoading(true);
        try {
          const [difficultyResult, learningPathResult] = await Promise.all([
            adjustQuizDifficulty({ userPerformance: performance, currentDifficulty: difficulty }),
            suggestPersonalizedLearningPaths({
              quizHistory: [{
                topic: topic,
                score: performance * 100,
                questionsAnswered: total,
                totalQuestions: total,
              }],
            }),
          ]);
          setAiDifficulty(difficultyResult);
          setAiLearningPath(learningPathResult);
        } catch (error) {
          console.error("Failed to get AI feedback:", error);
        } finally {
          setIsLoading(false);
        }
      };
      getAiFeedback();
    } else {
       setIsLoading(false);
    }
  }, [performance, difficulty, topic, total]);


  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  const performanceMessage = useMemo(() => {
    if (performance >= 0.9) return "Outstanding! You're a true master!";
    if (performance >= 0.7) return "Excellent work! You really know your stuff.";
    if (performance >= 0.5) return "Good job! A solid performance.";
    return "Nice try! Keep practicing to improve.";
  }, [performance]);
  
  const learningResources = sessionLearningResources || aiLearningPath?.suggestedResources;

  return (
    <div className="container mx-auto max-w-4xl py-8 md:py-12 text-center">
      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />}
      
      <Card className="bg-card/80 backdrop-blur-sm shadow-2xl shadow-primary/10 mb-8">
        <CardHeader>
          <Sparkles className="mx-auto h-12 w-12 text-primary animate-pulse" />
          <CardTitle className="text-4xl md:text-5xl font-bold mt-4">Quiz Complete!</CardTitle>
          <CardDescription className="text-lg text-foreground/70">{performanceMessage}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-6xl md:text-7xl font-bold text-primary my-4" style={{ textShadow: '0 0 10px hsl(var(--primary))' }}>
            {score} / {total}
          </p>
          <p className="text-2xl font-semibold">
            That's a score of {Math.round(performance * 100)}%
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/topics" passHref>
              <Button size="lg" className="font-bold">
                <RefreshCw className="mr-2 h-4 w-4" /> Play Again
              </Button>
            </Link>
            <Link href="/" passHref>
              <Button size="lg" variant="outline">
                <Home className="mr-2 h-4 w-4" /> Go to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="text-left">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Target className="text-accent" /> AI Difficulty Suggestion</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="animate-spin h-4 w-4" />Analyzing performance...</div>
            ) : aiDifficulty ? (
              <>
                <p className="text-muted-foreground">{aiDifficulty.reason}</p>
                <p className="mt-2">Suggested next level: <span className="font-bold text-accent capitalize">{aiDifficulty.suggestedDifficulty}</span></p>
              </>
            ) : (
              <p className="text-muted-foreground">Could not generate AI difficulty suggestion.</p>
            )}
          </CardContent>
        </Card>
        
        <Card className="text-left">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BrainCircuit className="text-accent" /> Personalized Learning Path</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="animate-spin h-4 w-4" />Generating recommendations...</div>
            ) : learningResources && learningResources.length > 0 ? (
              <ul className="space-y-3">
                {learningResources.map((res, index) => (
                  <li key={index}>
                    <a href={res.resourceLink} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline flex items-center gap-1">
                      {res.resourceName} <LinkIcon className='w-3 h-3' />
                    </a>
                    <p className="text-sm text-muted-foreground">{res.reason}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No specific learning resources to suggest at this time. Great job!</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
