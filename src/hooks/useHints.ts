import { useState, useEffect } from 'react';
import type { Hint } from '../types';

export function useHints() {
  const [hints, setHints] = useState<Hint[]>([]);

  useEffect(() => {
    chrome.storage.local.get(['hints'], (result: { hints?: Hint[] }) => {
      if (result.hints) setHints(result.hints);
    });
  }, []);

  const addHint = (hint: Hint) => {
    const newHints = [...hints, hint];
    setHints(newHints);
    chrome.storage.local.set({ hints: newHints });
  };

  const updateLastHint = (content: string, isStreaming: boolean = false) => {
    setHints(prev => {
      const last = prev[prev.length - 1];
      if (last && last.role === 'assistant') {
        const newHints = [...prev];
        newHints[newHints.length - 1] = { ...last, content: isStreaming ? last.content + content : content };
        if (!isStreaming) chrome.storage.local.set({ hints: newHints });
        return newHints;
      }
      return prev;
    });
  };

  // Finalize the streaming message in storage
  const finalizeHints = (finalHints: Hint[]) => {
    chrome.storage.local.set({ hints: finalHints });
  };

  const clearHints = () => {
    setHints([]);
    chrome.storage.local.set({ hints: [] });
  };

  return { hints, setHints, addHint, updateLastHint, finalizeHints, clearHints };
}
