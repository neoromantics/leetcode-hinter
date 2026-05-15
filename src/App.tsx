import { useState } from 'react';
import { useSettings } from './hooks/useSettings';
import { useHints } from './hooks/useHints';
import { Header } from './components/Header';
import { HintList } from './components/HintList';
import { SettingsPanel } from './components/SettingsPanel';
import type { ProblemData, Hint } from './types';
import { Loader2 } from 'lucide-react';

type View = 'hints' | 'settings';

function App() {
  const [view, setView] = useState<View>('hints');
  const { settings, updateSettings, isLoaded } = useSettings();
  const { hints, updateLastHint, finalizeHints, clearHints, setHints } = useHints();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleGetHint = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) throw new Error("No active tab found.");

      if (!tab.url?.includes('leetcode.com/problems/') && !tab.url?.includes('leetcode.cn/problems/')) {
        throw new Error("Please navigate to a LeetCode problem page to get hints.");
      }

      let problemData: ProblemData;
      try {
        problemData = await chrome.tabs.sendMessage(tab.id, { action: "GET_PROBLEM_DATA" });
      } catch (communicationError: any) {
        if (communicationError.message.includes("Could not establish connection")) {
          throw new Error("Extension not ready on this tab. Please refresh the LeetCode page and try again.");
        }
        throw communicationError;
      }

      if (!problemData || !problemData.title) {
        throw new Error("Could not extract problem data. Ensure you are on the 'Description' tab of the problem.");
      }

      // Add user context message to chat history visually (optional, or just track in background)
      // For a better UX, we'll just start the assistant bubble immediately.
      
      // Initialize an empty assistant hint
      const initialAssistantHint: Hint = { role: 'assistant', content: '' };
      const updatedHints = [...hints, initialAssistantHint];
      setHints(updatedHints);

      // Establish streaming connection
      const port = chrome.runtime.connect({ name: "hint-stream" });
      
      port.postMessage({
        action: "START_HINT_STREAM",
        payload: { settings, problemData, hints }
      });

      port.onMessage.addListener((msg) => {
        if (msg.type === "chunk") {
          updateLastHint(msg.content, true);
        } else if (msg.type === "done") {
          setIsLoading(false);
          // Sync final state to storage
          setHints(prev => {
            finalizeHints(prev);
            return prev;
          });
          port.disconnect();
        } else if (msg.type === "error") {
          setError(msg.message);
          setIsLoading(false);
          port.disconnect();
        }
      });

    } catch (err: any) {
      console.error('[LeetCode Hinter] Error:', err);
      let displayMessage = err.message;
      if (displayMessage.includes("Connection error") || displayMessage.includes("Failed to fetch")) {
        displayMessage = "Network connection failed. Please check your internet connection and ensure your API provider is accessible.";
      }
      setError(displayMessage);
      setIsLoading(false);
    }
  };

  const handleSaveSettings = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setView('hints');
    }, 500);
  };

  const hasAnyKey = Object.entries(settings).some(([key, val]) => 
    key.endsWith('Key') && val !== ''
  ) || (settings.provider === 'ollama');

  if (!isLoaded) return null;

  return (
    <div className="flex flex-col h-screen w-full bg-white overflow-hidden font-sans selection:bg-orange-100 antialiased">
      <Header 
        view={view} 
        onToggleView={() => setView(view === 'hints' ? 'settings' : 'hints')}
        onClearHints={clearHints}
        showClear={hints.length > 0}
      />

      <main className="flex-1 overflow-y-auto p-4 bg-neutral-50/30 scrollbar-thin scrollbar-thumb-neutral-200 scroll-smooth">
        {view === 'hints' ? (
          <HintList 
            hints={hints} 
            isLoading={isLoading} 
            error={error} 
            hasAnyKey={hasAnyKey} 
          />
        ) : (
          <div className="max-w-full overflow-x-hidden pb-10">
            <SettingsPanel 
              settings={settings} 
              onUpdate={updateSettings} 
              onSave={handleSaveSettings}
              isSaving={isSaving}
            />
          </div>
        )}
      </main>

      {/* Footer / Action */}
      {view === 'hints' && (
        <footer className="p-5 border-t bg-white shrink-0 shadow-[0_-4px_20px_-2px_rgba(0,0,0,0.08)]">
          <button 
            disabled={!hasAnyKey || isLoading} 
            onClick={handleGetHint} 
            className="w-full bg-brand text-white py-4.5 rounded-2xl font-black text-2xl shadow-xl shadow-orange-200 hover:bg-orange-600 hover:-translate-y-0.5 transition-all active:scale-95 active:translate-y-0 disabled:opacity-30 disabled:shadow-none disabled:translate-y-0 uppercase tracking-tighter flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={28} />
                <span>Thinking...</span>
              </>
            ) : (
              'Get Hint'
            )}
          </button>
          <p className="text-[11px] text-center text-neutral-400 mt-4 uppercase tracking-[0.25em] font-black">
            Powered by {settings.model}
          </p>
        </footer>
      )}
    </div>
  );
}

export default App;
