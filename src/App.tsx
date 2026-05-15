import { useState } from 'react';
import { useSettings } from './hooks/useSettings';
import { useHints } from './hooks/useHints';
import { useHintGenerator } from './hooks/useHintGenerator';
import { Header } from './components/Header';
import { HintList } from './components/HintList';
import { SettingsPanel } from './components/SettingsPanel';
import { Loader2 } from 'lucide-react';

type View = 'hints' | 'settings';

function App() {
  const [view, setView] = useState<View>('hints');
  const [isSaving, setIsSaving] = useState(false);

  const { settings, updateSettings, isLoaded } = useSettings();
  const { hints, updateLastHint, finalizeHints, clearHints, setHints } = useHints();
  
  const { generateHint, isLoading, error } = useHintGenerator({
    settings,
    hints,
    setHints,
    updateLastHint,
    finalizeHints
  });

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
            onSuggestionClick={(s) => generateHint(s)}
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
            onClick={() => generateHint()} 
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
