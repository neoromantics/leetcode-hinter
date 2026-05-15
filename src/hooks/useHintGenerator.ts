import { useState } from 'react';
import type { ProblemData, Hint, Settings } from '../types';
import type { StreamResponse } from '../types/messaging';

interface UseHintGeneratorProps {
  settings: Settings;
  hints: Hint[];
  setHints: React.Dispatch<React.SetStateAction<Hint[]>>;
  updateLastHint: (content: string, isStreaming?: boolean) => void;
  finalizeHints: (finalHints: Hint[]) => void;
}

export function useHintGenerator({ 
  settings, 
  hints, 
  setHints, 
  updateLastHint, 
  finalizeHints 
}: UseHintGeneratorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateHint = async (customQuery?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Get problem data from the active tab via proxy
      const problemData: ProblemData = await chrome.runtime.sendMessage({
        action: "PROXY_GET_PROBLEM_DATA"
      });

      if (!problemData || !problemData.title) {
        throw new Error("Could not extract problem data. Please ensure you are on a LeetCode problem page and refresh the page.");
      }

      // 2. Prepare the history
      let currentHistory = [...hints];
      
      // If there's a custom query, add it to history first
      if (customQuery) {
        const userHint: Hint = { role: 'user', content: customQuery };
        currentHistory.push(userHint);
      }

      // 3. Initialize an empty assistant hint in the UI
      const initialAssistantHint: Hint = { role: 'assistant', content: '' };
      const updatedHintsForUi = [...currentHistory, initialAssistantHint];
      setHints(updatedHintsForUi);

      // 4. Establish streaming connection with the background script
      const port = chrome.runtime.connect({ name: "hint-stream" });
      
      port.postMessage({
        action: "START_HINT_STREAM",
        payload: { settings, problemData, hints: currentHistory }
      });

      port.onMessage.addListener((msg: StreamResponse) => {
        if (msg.type === "chunk") {
          updateLastHint(msg.content, true);
        } else if (msg.type === "done") {
          setIsLoading(false);
          setHints(currentHints => {
            finalizeHints(currentHints);
            return currentHints;
          });
          port.disconnect();
        } else if (msg.type === "error") {
          setError(msg.message);
          setIsLoading(false);
          port.disconnect();
        }
      });

    } catch (err: any) {
      console.error('[LeetCode Hinter] Generation Error:', err);
      let displayMessage = err.message;
      if (displayMessage.includes("Connection error") || displayMessage.includes("Failed to fetch")) {
        displayMessage = "Network connection failed. Please check your internet connection and ensure your API provider is accessible.";
      }
      setError(displayMessage);
      setIsLoading(false);
    }
  };

  return { generateHint, isLoading, error, setError };
}
