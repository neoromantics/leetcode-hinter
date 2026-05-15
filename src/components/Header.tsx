import { Settings as SettingsIcon, MessageSquare, Lightbulb, Pin, PinOff } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  view: 'hints' | 'settings';
  onToggleView: () => void;
  onClearHints: () => void;
  showClear: boolean;
}

export function Header({ view, onToggleView, onClearHints, showClear }: HeaderProps) {
  const [isLocked, setIsLocked] = useState(false);

  // Check if we are in an iframe (overlay mode)
  const isOverlay = window.self !== window.top;

  const toggleLock = () => {
    const newLocked = !isLocked;
    setIsLocked(newLocked);
    window.parent.postMessage({ type: 'LEETCODE_HINTER_LOCK', locked: newLocked }, '*');
  };

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b bg-white shrink-0">
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-brand rounded-lg">
          <Lightbulb size={20} className="text-white" />
        </div>
        <h1 className="text-lg font-bold text-neutral-800 leading-tight">LeetCode Hinter</h1>
      </div>
      <div className="flex items-center gap-1">
        {isOverlay && (
          <button 
            onClick={toggleLock}
            className={`p-2 rounded-full transition-colors ${isLocked ? 'text-brand bg-orange-50' : 'text-neutral-400 hover:bg-neutral-100'}`}
            title={isLocked ? 'Unlock Panel' : 'Pin Panel Open'}
          >
            {isLocked ? <Pin size={18} fill="currentColor" /> : <PinOff size={18} />}
          </button>
        )}
        {showClear && view === 'hints' && (
          <button 
            onClick={onClearHints}
            className="text-xs text-neutral-400 hover:text-neutral-600 px-2 py-1 font-semibold uppercase tracking-wider transition-colors"
          >
            Clear
          </button>
        )}
        <button 
          onClick={onToggleView}
          className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-600"
          title={view === 'hints' ? 'Settings' : 'Back to Hints'}
        >
          {view === 'hints' ? <SettingsIcon size={20} /> : <MessageSquare size={20} />}
        </button>
      </div>
    </header>
  );
}
