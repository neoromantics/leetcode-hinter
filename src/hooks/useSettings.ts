import { useState, useEffect } from 'react';
import type { Settings } from '../types';

const DEFAULT_SETTINGS: Settings = {
  openaiKey: '',
  geminiKey: '',
  anthropicKey: '',
  deepseekKey: '',
  openrouterKey: '',
  togetherKey: '',
  ollamaUrl: 'http://localhost:11434/v1',
  provider: 'openai',
  model: 'o3-mini'
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    chrome.storage.local.get(Object.keys(DEFAULT_SETTINGS), (result) => {
      setSettings(prev => ({ ...prev, ...result }));
      setIsLoaded(true);
    });
  }, []);

  const updateSettings = (updates: Partial<Settings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    chrome.storage.local.set(updates);
  };

  return { settings, updateSettings, isLoaded };
}
