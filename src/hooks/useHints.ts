import { useState } from 'react';
import type { Hint } from '../types';

/**
 * useHints manages the conversation history in memory.
 * Per requirement, this state is NOT persisted to storage.
 * Refreshing the page or closing the extension will clear the history.
 */
export function useHints() {
  const [hints, setHints] = useState<Hint[]>([]);

  const addHint = (hint: Hint) => {
    const newHints = [...hints, hint];
    setHints(newHints);
  };

  const updateLastHint = (content: string, isStreaming: boolean = false) => {
    setHints(prev => {
      const last = prev[prev.length - 1];
      if (last && last.role === 'assistant') {
        const newHints = [...prev];
        newHints[newHints.length - 1] = { 
          ...last, 
          content: isStreaming ? last.content + content : content 
        };
        return newHints;
      }
      return prev;
    });
  };

  // No-op finalize for stateless mode
  const finalizeHints = (_finalHints: Hint[]) => {
    // History is not saved
  };

  const clearHints = () => {
    setHints([]);
  };

  return { hints, setHints, addHint, updateLastHint, finalizeHints, clearHints };
}
