import { useEffect, useRef } from 'react';
import { Lightbulb, Loader2 } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import type { Hint } from '../types';

interface HintListProps {
  hints: Hint[];
  isLoading: boolean;
  error: string | null;
  hasAnyKey: boolean;
}

export function HintList({ hints, isLoading, error, hasAnyKey }: HintListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when hints change or loading starts
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [hints, isLoading, error]);

  if (hints.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="p-8 bg-orange-50 rounded-full animate-pulse shadow-inner">
          <Lightbulb size={80} className="text-brand" />
        </div>
        <div className="space-y-3 px-4">
          <h2 className="text-3xl font-black text-neutral-800 tracking-tight">Need a nudge?</h2>
          <p className="text-neutral-500 max-w-[280px] mx-auto text-base leading-relaxed font-medium">
            Open a LeetCode problem and I'll analyze your current progress to give you a smart hint.
          </p>
        </div>
        {!hasAnyKey && (
          <div className="px-6 py-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold animate-bounce shadow-sm mx-4">
            ⚠️ Please configure your API key in settings.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4 pb-6">
      {hints.map((hint, i) => (
        <MessageBubble key={i} hint={hint} />
      ))}
      
      {isLoading && (
        <div className="flex items-start gap-3 p-4 bg-white border border-neutral-100 rounded-2xl animate-pulse shadow-sm self-start mr-8">
          <Loader2 className="animate-spin text-brand mt-1" size={18} />
          <div className="space-y-2">
            <p className="text-sm font-medium text-neutral-600">Analyzing your logic...</p>
            <div className="h-2 w-24 bg-neutral-100 rounded-full overflow-hidden">
              <div className="h-full bg-brand/30 animate-progress w-full origin-left"></div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex flex-col gap-1 shadow-sm animate-in shake-1">
          <strong className="font-bold flex items-center gap-1">
            <span>Execution Error</span>
          </strong>
          <p className="opacity-90 leading-relaxed">{error}</p>
        </div>
      )}
      
      <div ref={bottomRef} className="h-2" />
    </div>
  );
}
