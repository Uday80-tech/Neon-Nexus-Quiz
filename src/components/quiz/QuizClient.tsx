"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import * as Tone from 'tone';
import type { Question, Topic } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { ArrowRight, CheckCircle2, XCircle } from 'lucide-react';

const QUESTION_TIME_LIMIT = 15; // seconds

export default function QuizClient({ questions, topic }: { questions: Question[], topic: Topic }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_LIMIT);
  const [showFeedback, setShowFeedback] = useState(false);
  
  const router = useRouter();

  const synth = useMemo(() => {
    if (typeof window !== 'undefined') {
      return new Tone.Synth().toDestination();
    }
    return null;
  }, []);

  const playSound = useCallback(async (correct: boolean) => {
    if (!synth) return;
    try {
      if (Tone.context.state !== 'running') {
        await Tone.start();
      }
      if (correct) {
        synth.triggerAttackRelease('C5', '8n');
      } else {
        synth.triggerAttackRelease('A2', '8n');
      }
    } catch (error) {
      console.error("Could not play sound:", error);
    }
  }, [synth]);

  useEffect(() => {
    if (isAnswered) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleNextQuestion(true); // Timeout, counts as incorrect
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestionIndex, isAnswered]);

  const handleOptionSelect = (optionIndex: number) => {
    if (isAnswered) return;
    
    setIsAnswered(true);
    setSelectedOption(optionIndex);
    setShowFeedback(true);
    const isCorrect = optionIndex === questions[currentQuestionIndex].correctAnswer;
    
    if (isCorrect) {
      setScore(score + 1);
    }
    
    playSound(isCorrect);
  };

  const handleNextQuestion = (timeout: boolean = false) => {
    if (!timeout && !isAnswered) return;

    setShowFeedback(false);
    
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedOption(null);
        setIsAnswered(false);
        setTimeLeft(QUESTION_TIME_LIMIT);
      } else {
        router.push(`/result?score=${score}&total=${questions.length}&topic=${topic.slug}&difficulty=${topic.difficulty}`);
      }
    }, 500); // Short delay for transition
  };
  
  const currentQuestion = questions[currentQuestionIndex];
  const progressValue = (timeLeft / QUESTION_TIME_LIMIT) * 100;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-card/80 backdrop-blur-sm shadow-2xl shadow-primary/10">
        <CardHeader className="text-center">
          <p className="text-sm font-medium text-accent">{topic.name}</p>
          <CardTitle className="text-3xl font-bold">Question {currentQuestionIndex + 1}/{questions.length}</CardTitle>
          <div className="pt-4">
            <Progress value={progressValue} className="w-full h-2 [&>div]:bg-primary transition-all duration-1000 linear" />
             <p className="text-sm text-muted-foreground mt-1 text-right">{timeLeft}s</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="my-6 min-h-[6rem] flex items-center justify-center">
            <p className="text-xl md:text-2xl text-center font-semibold text-foreground">
              {currentQuestion.question}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options.map((option, index) => {
              const isCorrect = index === currentQuestion.correctAnswer;
              const isSelected = index === selectedOption;

              return (
                <Button
                  key={index}
                  variant="outline"
                  size="lg"
                  className={cn(
                    "h-auto py-4 text-base whitespace-normal justify-start text-left transition-all duration-300",
                    "border-2",
                    isAnswered && isCorrect ? 'bg-green-500/20 border-green-500 text-foreground' : '',
                    isAnswered && isSelected && !isCorrect ? 'bg-red-500/20 border-red-500 text-foreground' : '',
                    !isAnswered ? 'hover:border-accent hover:bg-accent/10' : 'cursor-not-allowed'
                  )}
                  onClick={() => handleOptionSelect(index)}
                  disabled={isAnswered}
                >
                  <div className="flex items-center w-full">
                    <span className="flex-1">{option}</span>
                    {isAnswered && isSelected && isCorrect && <CheckCircle2 className="text-green-500 ml-2" />}
                    {isAnswered && isSelected && !isCorrect && <XCircle className="text-red-500 ml-2" />}
                    {isAnswered && !isSelected && isCorrect && <CheckCircle2 className="text-green-500 ml-2" />}
                  </div>
                </Button>
              );
            })}
          </div>

          <div className="mt-8 flex justify-end">
             {isAnswered && (
                 <Button
                    onClick={() => handleNextQuestion()}
                    className="font-bold text-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 transform hover:scale-105 shadow-[0_0_15px_rgba(52,209,191,0.6)] hover:shadow-[0_0_25px_rgba(52,209,191,0.9)] animate-in fade-in"
                  >
                   {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'} <ArrowRight className="ml-2" />
                 </Button>
             )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
