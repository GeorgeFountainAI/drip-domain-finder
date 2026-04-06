import React, { useState } from 'react';
import { generateBrandNames, type GeneratedDomain } from '@/utils/brandNameGenerator';
import { getNamecheapLink } from '@/utils/getNamecheapLink';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ArrowRight, Mail } from 'lucide-react';

export default function LandingPage() {
  const [keyword, setKeyword] = useState('');
  const [vibe, setVibe] = useState('');
  const [results, setResults] = useState<GeneratedDomain[]>([]);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  const handleGenerate = () => {
    if (!keyword.trim()) return;
    setLoading(true);
    // Small delay for UX feel
    setTimeout(() => {
      const domains = generateBrandNames(keyword, vibe, 18);
      setResults(domains);
      setLoading(false);
      // Scroll to results
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, 600);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setEmailSubmitted(true);
      // Generate more results
      const more = generateBrandNames(keyword, vibe, 20);
      setResults(prev => [...prev, ...more]);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Demo Banner */}
      <div className="w-full bg-primary/10 border-b border-primary/20 py-2 text-center text-sm font-medium text-primary">
        Demo Mode – No login required
      </div>

      {/* Hero / Intake */}
      <div className="flex flex-col items-center justify-center px-4 pt-16 pb-12 md:pt-24 md:pb-16">
        <div className="mb-2 flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">DomainDrip</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-center mb-3 bg-gradient-primary bg-clip-text text-transparent leading-tight">
          Generate Brandable Domain Names
        </h1>
        <p className="text-lg text-muted-foreground text-center max-w-xl mb-10">
          Get short, clean, brand-ready domain ideas in seconds
        </p>

        <div className="w-full max-w-lg space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">What are you building?</label>
            <Input
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              placeholder="e.g., AI tool for job seekers, hair salon, fitness app"
              className="h-12 text-base"
              onKeyDown={e => e.key === 'Enter' && handleGenerate()}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Style / Vibe <span className="text-muted-foreground">(optional)</span></label>
            <Input
              value={vibe}
              onChange={e => setVibe(e.target.value)}
              placeholder="modern, premium, urban, playful"
              className="h-12 text-base"
              onKeyDown={e => e.key === 'Enter' && handleGenerate()}
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!keyword.trim() || loading}
            className="w-full h-14 text-lg font-semibold mt-2"
            size="lg"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full" />
                Generating…
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Generate Names <ArrowRight className="h-5 w-5" />
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div id="results" className="px-4 pb-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Your Domain Ideas
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {results.map((d, i) => (
              <div
                key={`${d.full}-${i}`}
                className="flex items-center justify-between rounded-lg border bg-card p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-card-foreground">{d.full}</span>
                  <Badge
                    variant={d.available ? 'default' : 'secondary'}
                    className={d.available ? 'bg-green-600 hover:bg-green-700 text-white w-fit text-xs' : 'w-fit text-xs'}
                  >
                    {d.available ? 'Available' : 'Taken'}
                  </Badge>
                </div>
                {d.available && (
                  <a
                    href={getNamecheapLink(d.full)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 ml-3 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Buy
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* Email Capture */}
          {!emailSubmitted && (
            <div className="mt-10 text-center">
              <p className="text-muted-foreground mb-3">Want more names like these?</p>
              <form onSubmit={handleEmailSubmit} className="flex gap-2 max-w-sm mx-auto">
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="h-10"
                />
                <Button type="submit" size="sm" className="shrink-0 gap-1.5">
                  <Mail className="h-4 w-4" /> Get 20 More Ideas
                </Button>
              </form>
            </div>
          )}
          {emailSubmitted && (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              ✓ 20 more ideas added above!
            </p>
          )}
        </div>
      )}
    </div>
  );
}
