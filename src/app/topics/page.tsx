
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { topics } from '@/lib/quiz-data';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TopicSelectorPage() {
  return (
    <div className="container mx-auto max-w-5xl py-8 md:py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-primary" style={{ textShadow: '0 0 8px hsl(var(--primary))' }}>
          Choose Your Arena
        </h1>
        <p className="mt-2 text-lg text-foreground/70">Select a topic to begin your battle of wits, or create your own!</p>
        <div className='mt-4'>
           <Link href="/" passHref>
             <Button>Create a Custom Quiz</Button>
           </Link>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {topics.map((topic) => (
          <Link href={`/quiz/${topic.slug}`} key={topic.slug} className="group">
            <Card className="bg-card/70 h-full backdrop-blur-sm border-2 border-transparent hover:border-accent transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-accent/20">
              <CardHeader className="flex-row items-center gap-4">
                <div className="bg-accent/10 p-3 rounded-lg">
                   <div className="w-8 h-8 text-accent flex items-center justify-center">
                     <topic.icon strokeWidth={1.5} />
                   </div>
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl text-accent-foreground group-hover:text-accent transition-colors">
                    {topic.name}
                  </CardTitle>
                  <CardDescription className="text-foreground/60 mt-1">
                    {topic.description}
                  </CardDescription>
                </div>
                <ArrowRight className="w-6 h-6 text-foreground/30 group-hover:text-accent transition-all group-hover:translate-x-1" />
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
