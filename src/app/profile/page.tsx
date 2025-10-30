"use client";

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BrainCircuit, ChevronRight, LineChart, Loader2 } from 'lucide-react';
import { quizHistoryData } from '@/lib/quiz-history-data';
import { suggestPersonalizedQuizzes, SuggestPersonalizedQuizzesOutput } from '@/ai/flows/suggest-personalized-quizzes';
import { topics } from '@/lib/quiz-data';
import Link from 'next/link';
import { format } from 'date-fns';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { CartesianGrid, Line, XAxis, YAxis, ResponsiveContainer, LineChart as RechartsLineChart, Tooltip } from 'recharts';

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<SuggestPersonalizedQuizzesOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const chartData = useMemo(() => {
    return quizHistoryData
      .slice() // Create a copy to avoid mutating the original array
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(item => ({
        date: format(new Date(item.date), 'MMM d'),
        score: item.score,
      }));
  }, []);

  const chartConfig = {
    score: {
      label: "Score",
      color: "hsl(var(--primary))",
    },
  };

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);
  
  useEffect(() => {
    if (user) {
      const getSuggestions = async () => {
        setIsLoading(true);
        try {
          const aiInput = {
            quizHistory: quizHistoryData.map(h => ({
              topic: h.topic,
              score: h.score,
              questionsAnswered: Math.round(h.totalQuestions * (h.score / 100)),
              totalQuestions: h.totalQuestions,
            })),
            topics: topics.map(t => t.name),
          };
          const result = await suggestPersonalizedQuizzes(aiInput);
          setSuggestions(result);
        } catch (error) {
          console.error("Failed to get AI suggestions:", error);
          setSuggestions(null);
        } finally {
          setIsLoading(false);
        }
      };
      getSuggestions();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl py-8 md:py-12">
      <h1 className="text-4xl md:text-5xl font-bold mb-8">User Profile</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <Card>
            <CardHeader className="flex-row items-center gap-4">
              <Avatar className="h-20 w-20 border-2 border-primary">
                <AvatarImage src={`https://api.dicebear.com/8.x/bottts/svg?seed=${user.email}`} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-3xl">{user.name}</CardTitle>
                <CardDescription className="text-base">{user.email}</CardDescription>
              </div>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="text-primary" />
                Progress Chart
              </CardTitle>
              <CardDescription>Your quiz score performance over time.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <RechartsLineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickCount={6}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    cursor={{
                      stroke: "hsl(var(--border))",
                      strokeWidth: 2,
                      strokeDasharray: "3 3",
                    }}
                    content={<ChartTooltipContent 
                      formatter={(value) => `${value}%`}
                    />}
                  />
                  <Line
                    dataKey="score"
                    type="monotone"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{
                      fill: "hsl(var(--primary))",
                      r: 4,
                    }}
                    activeDot={{
                      r: 6,
                      style: { stroke: "hsl(var(--primary))", opacity: 0.25 },
                    }}
                  />
                </RechartsLineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quiz History</CardTitle>
              <CardDescription>Your recent quiz performance.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Topic</TableHead>
                    <TableHead className="text-center">Score</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quizHistoryData.map((history, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{history.topic}</TableCell>
                      <TableCell className="text-center">{history.score}%</TableCell>
                      <TableCell className="text-right">{format(new Date(history.date), 'MMM d, yyyy')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BrainCircuit className="text-accent" /> AI Recommendations</CardTitle>
              <CardDescription>We think you should try these topics next!</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-24">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : suggestions && suggestions.suggestedQuizzes.length > 0 ? (
                <ul className="space-y-3">
                  {suggestions.suggestedQuizzes.map((quiz, index) => {
                    const topicInfo = topics.find(t => t.name === quiz.topic);
                    if (!topicInfo) return null;
                    return (
                      <li key={index}>
                        <Link href={`/quiz/${topicInfo.slug}`} className="group">
                           <div className="p-3 rounded-lg border hover:border-accent hover:bg-accent/10 transition-colors">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-bold group-hover:text-accent">{quiz.topic}</p>
                                <p className="text-sm text-muted-foreground">{quiz.reason}</p>
                              </div>
                              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-transform group-hover:translate-x-1" />
                            </div>
                           </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-center text-muted-foreground h-24 flex items-center justify-center">No suggestions for now. Keep playing!</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
