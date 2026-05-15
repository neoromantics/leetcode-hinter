import { Save } from 'lucide-react';
import { MODELS } from '../constants';
import type { Settings, Provider } from '../types';

interface SettingsPanelProps {
  settings: Settings;
  onUpdate: (updates: Partial<Settings>) => void;
  onSave: () => void;
  isSaving: boolean;
}

export function SettingsPanel({ settings, onUpdate, onSave, isSaving }: SettingsPanelProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-full">
      <section>
        <h2 className="text-xl font-bold text-neutral-800 mb-1">Settings</h2>
        <p className="text-xs text-neutral-500 mb-6 uppercase tracking-wider font-semibold">AI Provider Configuration</p>
        
        <div className="space-y-6">
          <div className="p-5 bg-white border border-neutral-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <label className="block text-[11px] font-black text-neutral-400 mb-3 uppercase tracking-widest">AI Provider</label>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(MODELS) as Provider[]).map((p) => (
                <button
                  key={p}
                  onClick={() => onUpdate({ provider: p, model: MODELS[p][0] })}
                  className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-tight transition-all border ${
                    settings.provider === p 
                      ? 'bg-neutral-900 text-white shadow-md border-neutral-900' 
                      : 'bg-white text-neutral-400 hover:bg-neutral-50 border-neutral-100'
                  }`}
                >
                  {p === 'openrouter' ? 'OpenRouter' : p === 'together' ? 'Together AI' : p === 'openai' ? 'OpenAI' : p}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 bg-white border border-neutral-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <label className="block text-[11px] font-black text-neutral-400 mb-3 uppercase tracking-widest">Select Model</label>
            <select
              value={settings.model}
              onChange={(e) => onUpdate({ model: e.target.value })}
              className="w-full px-4 py-3 border border-neutral-100 rounded-xl bg-neutral-50 text-base font-medium focus:ring-2 focus:ring-brand outline-none truncate transition-all appearance-none cursor-pointer"
            >
              {MODELS[settings.provider].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="p-5 bg-white border border-neutral-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <label className="block text-[11px] font-black text-neutral-400 mb-3 uppercase tracking-widest">
              {settings.provider === 'ollama' ? 'Ollama API URL' : `${settings.provider.charAt(0).toUpperCase() + settings.provider.slice(1)} API Key`}
            </label>
            <input
              type={settings.provider === 'ollama' ? "text" : "password"}
              value={(settings as any)[`${settings.provider}Key`] || (settings.provider === 'ollama' ? settings.ollamaUrl : '')}
              onChange={(e) => onUpdate({ [settings.provider === 'ollama' ? 'ollamaUrl' : `${settings.provider}Key`]: e.target.value })}
              placeholder={settings.provider === 'ollama' ? "http://localhost:11434/v1" : "Enter key..."}
              className="w-full px-4 py-3 border border-neutral-100 rounded-xl focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all text-base font-mono bg-neutral-50 overflow-hidden text-ellipsis"
            />
            <p className="mt-3 text-[11px] text-neutral-400 leading-relaxed italic">
              {settings.provider === 'ollama' 
                ? 'Local endpoint for your Ollama instance.' 
                : 'Stored locally and used only for direct API calls.'}
            </p>
          </div>
        </div>
      </section>

      <button 
        onClick={onSave} 
        disabled={isSaving} 
        className="w-full bg-neutral-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-neutral-200 disabled:opacity-50 uppercase text-sm tracking-widest mt-4 mb-8"
      >
        {isSaving ? (
          'Saving Changes...'
        ) : (
          <>
            <Save size={16} />
            Save Configuration
          </>
        )}
      </button>
    </div>
  );
}
