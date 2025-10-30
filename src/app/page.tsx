import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ThreeScene from '@/components/ThreeScene';
import { ArrowRight, Trophy } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative flex-1 flex items-center justify-center overflow-hidden">
      <ThreeScene />
      <div className="relative z-10 flex flex-col items-center text-center p-4">
        <h1 
          className="text-5xl md:text-7xl lg:text-8xl font-bold text-primary animate-pulse"
          style={{ textShadow: '0 0 10px hsl(var(--primary)), 0 0 20px hsl(var(--primary)), 0 0 40px hsl(var(--primary))' }}
        >
          Neon Nexus Quiz
        </h1>
        <p className="mt-4 max-w-2xl text-lg md:text-xl text-foreground/80">
          Challenge your knowledge in a futuristic AI-powered quiz arena. Choose your topic and battle the clock to climb the leaderboard!
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link href="/topics" passHref>
            <Button 
              size="lg" 
              className="font-bold text-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 transform hover:scale-105 shadow-[0_0_15px_rgba(52,209,191,0.6)] hover:shadow-[0_0_25px_rgba(52,209,191,0.9)]"
            >
              Start Quiz <ArrowRight className="ml-2" />
            </Button>
          </Link>
          <Link href="/leaderboard" passHref>
            <Button 
              size="lg" 
              variant="outline"
              className="font-bold text-lg border-accent text-accent hover:bg-accent/10 transition-all duration-300 transform hover:scale-105 shadow-[0_0_15px_rgba(162,57,234,0.6)] hover:shadow-[0_0_25px_rgba(162,57,234,0.9)]"
            >
              <Trophy className="mr-2" /> Leaderboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
