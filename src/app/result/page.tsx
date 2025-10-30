
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import useWindowSize from 'react-use/lib/useWindowSize';
import Confetti from 'react-confetti';
import Link from 'next/link';

import { adjustQuizDifficulty, AdjustQuizDifficultyOutput } from '@/ai/flows/adjust-quiz-difficulty-dynamically';
import { suggestPersonalizedLearningPaths, SuggestPersonalizedLearningPathsOutput } from '@/ai/flows/suggest-personalized-learning-paths';
import type { SuggestPersonalizedLearningPathsOutput as LearningResources } from '@/ai/flows/suggest-personalized-learning-paths';

import { useFirestore, useUser } from '@/firebase';
import { collection, serverTimestamp, doc, getDoc, setDoc } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';


import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BrainCircuit, Home, Link as LinkIcon, Loader2, RefreshCw, Sparkles, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { topics as staticTopics } from '@/lib/quiz-data';

// This is the core component that contains all the logic.
// It's wrapped in a Suspense boundary in the main export.
function ResultPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { width, height } = useWindowSize();
  const { toast } = useToast();

  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const [showConfetti, setShowConfetti] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(true);
  const [isDataSaved, setIsDataSaved] = useState(false);
  
  const [aiDifficulty, setAiDifficulty] = useState<AdjustQuizDifficultyOutput | null>(null);
  const [aiLearningPath, setAiLearningPath] = useState<SuggestPersonalizedLearningPathsOutput | null>(null);
  const [sessionLearningResources, setSessionLearningResources] = useState<LearningResources['suggestedResources'] | null>(null);

  // Memoize search param values to prevent re-renders
  const { score, total, topicSlug, difficulty } = useMemo(() => ({
    score: parseInt(searchParams.get('score') || '0', 10),
    total: parseInt(searchParams.get('total') || '0', 10),
    topicSlug: searchParams.get('topic') || '',
    difficulty: (searchParams.get('difficulty') || 'medium') as 'easy' | 'medium' | 'hard',
  }), [searchParams]);

  const topicName = useMemo(() => {
    if (topicSlug === 'custom' || topicSlug === 'custom-training') {
      const storedTopic = sessionStorage.getItem('quizTopic');
      if (storedTopic) {
        return JSON.parse(storedTopic).name;
      }
    }
    const staticTopic = staticTopics.find(t => t.slug === topicSlug);
    return staticTopic?.name || topicSlug;
  }, [topicSlug]);

  const performance = useMemo(() => (total > 0 ? score / total : 0), [score, total]);
  const scorePercentage = useMemo(() => Math.round(performance * 100), [performance]);

  // --- Effects ---

  useEffect(() => {
    // Redirect to login if user is not available after loading
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    // Save quiz results to Firestore once
    const saveResults = async () => {
      if (user && firestore && total > 0 && !isDataSaved) {
        // Save private quiz history
        const historyData = {
          topic: topicName,
          score: scorePercentage,
          totalQuestions: total,
          completionTime: 0, 
          completedAt: serverTimestamp(),
          date: new Date().toISOString(),
        };
        addDocumentNonBlocking(collection(firestore, `users/${user.uid}/quizHistory`), historyData);

        // Update public leaderboard score
        const leaderboardRef = doc(firestore, 'leaderboard', user.uid);
        try {
          const leaderboardSnap = await getDoc(leaderboardRef);
          let newTotalScore = score;
          
          if (leaderboardSnap.exists()) {
            newTotalScore += leaderboardSnap.data().totalScore || 0;
          }

          const leaderboardData = {
            userId: user.displayName || user.email || 'Anonymous',
            totalScore: newTotalScore,
            lastPlayed: serverTimestamp(),
          };
          
          // Use setDoc with merge to create or update the leaderboard entry
          await setDoc(leaderboardRef, leaderboardData, { merge: true });

        } catch (error) {
           console.error("Failed to update leaderboard:", error);
           toast({
             variant: "destructive",
             title: "Leaderboard Error",
             description: "Could not update your score on the leaderboard.",
           });
        }
        
        setIsDataSaved(true);
      }
    };
    saveResults();
  }, [user, firestore, topicName, total, isDataSaved, scorePercentage, score, toast]);

  useEffect(() => {
    // Fetch AI feedback
    if (total > 0) {
      const getAiFeedback = async () => {
        setIsAiLoading(true);
        try {
          const [difficultyResult, learningPathResult] = await Promise.all([
            adjustQuizDifficulty({ userPerformance: performance, currentDifficulty: difficulty }),
            suggestPersonalizedLearningPaths({
              quizHistory: [{ topic: topicName, score: scorePercentage, questionsAnswered: score, totalQuestions: total }],
            }),
          ]);
          setAiDifficulty(difficultyResult);
          setAiLearningPath(learningPathResult);
        } catch (error) {
          console.error("Failed to get AI feedback:", error);
        } finally {
          setIsAiLoading(false);
        }
      };
      getAiFeedback();
    } else {
      setIsAiLoading(false);
    }

    // Check for session-based learning resources (from training plans)
    const storedResources = sessionStorage.getItem('learningResources');
    if (storedResources) {
      setSessionLearningResources(JSON.parse(storedResources));
      sessionStorage.removeItem('learningResources');
    }
    
  }, [performance, difficulty, topicName, total, score, scorePercentage]);
  
  useEffect(() => {
    // Stop confetti after a few seconds
    const timer = setTimeout(() => setShowConfetti(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  // --- Memos for display ---

  const performanceMessage = useMemo(() => {
    if (performance >= 0.9) return "Outstanding! A true master!";
    if (performance >= 0.7) return "Excellent work! You really know your stuff.";
    if (performance >= 0.5) return "Good job! A solid performance.";
    return "Nice try! Keep practicing to improve.";
  }, [performance]);

  const learningResources = sessionLearningResources || aiLearningPath?.suggestedResources;

  if (isUserLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      {showConfetti && performance > 0.6 && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />}
      <div className="container mx-auto max-w-4xl py-8 md:py-12">
        {/* Main Score Card */}
        <Card className="text-center bg-card/80 backdrop-blur-sm shadow-2xl shadow-primary/10 mb-8 overflow-hidden">
          <CardHeader className="pb-4">
            <Sparkles className="mx-auto h-12 w-12 text-primary" style={{ filter: 'drop-shadow(0 0 10px hsl(var(--primary)))' }} />
            <CardTitle className="text-4xl md:text-5xl font-bold mt-4">Quiz Complete!</CardTitle>
            <CardDescription className="text-lg text-foreground/80">{performanceMessage}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="my-4">
              <span className="text-6xl md:text-7xl font-bold text-primary" style={{ textShadow: '0 0 10px hsl(var(--primary))) }}>
                {score}
              </span>
              <span className="text-4xl font-bold text-muted-foreground"> / {total}</span>
            </div>
            <div className="w-4/5 mx-auto bg-primary/20 text-primary font-bold text-xl rounded-full px-4 py-2">
              Score: {scorePercentage}%
            </div>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/topics" passHref>
                <Button size="lg"><RefreshCw className="mr-2" /> Play Another</Button>
              </Link>
              <Link href="/" passHref>
                <Button size="lg" variant="outline"><Home className="mr-2" /> Go Home</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* AI Feedback Section */}
        <Card className="text-left">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-3"><BrainCircuit className="text-accent" /> AI Feedback</CardTitle>
            <CardDescription>Personalized recommendations based on your performance.</CardDescription>
          </CardHeader>
          <CardContent>
            {isAiLoading ? (
              <div className="flex justify-center items-center h-24">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <h3 className="font-semibold flex items-center gap-2"><Target /> Next Challenge</h3>
                  <Separator className="my-2" />
                  {aiDifficulty ? (
                     <>
                      <p className="mt-2 text-muted-foreground">{aiDifficulty.reason}</p>
                      <p className="mt-2">Suggested level: <span className={cn('font-bold capitalize px-2 py-1 rounded-md', 
                        aiDifficulty.suggestedDifficulty === 'easy' && 'bg-green-500/20 text-green-300',
                        aiDifficulty.suggestedDifficulty === 'medium' && 'bg-yellow-500/20 text-yellow-300',
                        aiDifficulty.suggestedDifficulty === 'hard' && 'bg-red-500/20 text-red-300'
                        )}>{aiDifficulty.suggestedDifficulty}</span></p>
                    </>
                  ) : (
                    <p className="text-muted-foreground text-sm">Could not generate difficulty suggestion.</p>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold flex items-center gap-2"><Sparkles className="text-sm" /> Learning Path</h3>
                  <Separator className="my-2" />
                  {learningResources && learningResources.length > 0 ? (
                    <ul className="space-y-3 mt-2">
                      {learningResources.map((res, index) => (
                        <li key={index} className="text-sm">
                          <a href={res.resourceLink} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline flex items-center gap-1.5">
                            <LinkIcon className="w-3.5 h-3.5" /> {res.resourceName}
                          </a>
                          <p className="text-muted-foreground pl-5">{res.reason}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                     <p className="text-muted-foreground text-sm">No specific learning resources to suggest. Great job!</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

// Main export with Suspense Boundary for useSearchParams
export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    }>
      <ResultPageContent />
    </Suspense>
  );
}

    