import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { leaderboardData } from '@/lib/leaderboard-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import ThreeScene from '@/components/ThreeScene';

export default function LeaderboardPage() {
  return (
    <div className="relative flex-1">
      <ThreeScene />
      <div className="container mx-auto max-w-3xl py-8 md:py-12 relative z-10">
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <Trophy className="mx-auto h-12 w-12 text-primary" style={{ filter: 'drop-shadow(0 0 8px hsl(var(--primary)))' }}/>
            <CardTitle className="text-4xl md:text-5xl font-bold text-primary mt-2" style={{ textShadow: '0 0 8px hsl(var(--primary))' }}>
              Top Players
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Rank</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboardData.map((entry) => (
                  <TableRow key={entry.rank} className={cn(
                    entry.rank === 1 && 'bg-primary/20',
                    entry.rank === 2 && 'bg-primary/15',
                    entry.rank === 3 && 'bg-primary/10',
                  )}>
                    <TableCell className="font-bold text-xl">
                      <span className={cn(
                        'flex items-center justify-center w-10 h-10 rounded-full',
                        entry.rank === 1 && 'bg-yellow-400 text-yellow-900',
                        entry.rank === 2 && 'bg-gray-400 text-gray-900',
                        entry.rank === 3 && 'bg-yellow-600 text-yellow-100',
                      )}>
                        {entry.rank}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={entry.avatar} />
                          <AvatarFallback>{entry.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{entry.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-lg text-primary">{entry.score.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
