import { useState, type FormEvent } from 'react';
import { METHOD, STORAGE_KEYS } from '@/constants';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useToast } from '@/context/ToastContext';
import { readStorage, writeStorage } from '@/utils/storage';
import { Button } from '@/components/ui/Button';
import { resetDB } from '@/services/store';
import { progressService } from '@/services/progressService';

interface Prefs {
  ttsRate: number;
  listenCount: number;
  speakCount: number;
  listenGapMs: number;
}

const DEFAULT_PREFS: Prefs = {
  ttsRate: METHOD.ttsRate,
  listenCount: METHOD.listenCount,
  speakCount: METHOD.speakCount,
  listenGapMs: METHOD.listenGapMs,
};

export function AdminSettingsPage() {
  usePageMeta('Admin Settings — SunoBolo English', '');
  const { toast } = useToast();
  const [prefs, setPrefs] = useState<Prefs>(() => ({ ...DEFAULT_PREFS, ...readStorage<Partial<Prefs>>(STORAGE_KEYS.prefs, {}) }));

  const save = (e: FormEvent) => {
    e.preventDefault();
    writeStorage(STORAGE_KEYS.prefs, prefs);
    toast('Settings save ho gaye ✅ (Phase 1: sirf is device par)');
  };

  return (
    <div>
      <h2 className="mb-2">Settings</h2>
      <div className="card" style={{ maxWidth: 560 }}>
        <h3 className="mb-2">Learning defaults</h3>
        <form onSubmit={save}>
          <div className="field">
            <label htmlFor="tts-rate">TTS speaking rate ({prefs.ttsRate})</label>
            <input
              id="tts-rate"
              type="range"
              min={0.5}
              max={1.5}
              step={0.05}
              value={prefs.ttsRate}
              onChange={(e) => setPrefs({ ...prefs, ttsRate: Number(e.target.value) })}
            />
            <span className="field__hint">Kam rate = dheere aur clear bolna (recommended for learners).</span>
          </div>
          <div className="flex">
            <div className="field grow">
              <label htmlFor="listen-count">Listen count</label>
              <select id="listen-count" value={prefs.listenCount} onChange={(e) => setPrefs({ ...prefs, listenCount: Number(e.target.value) })}>
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
              </select>
            </div>
            <div className="field grow">
              <label htmlFor="speak-count">Speak count</label>
              <select id="speak-count" value={prefs.speakCount} onChange={(e) => setPrefs({ ...prefs, speakCount: Number(e.target.value) })}>
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
              </select>
            </div>
            <div className="field grow">
              <label htmlFor="gap">Gap between repeats (ms)</label>
              <input
                id="gap"
                type="number"
                value={prefs.listenGapMs}
                onChange={(e) => setPrefs({ ...prefs, listenGapMs: Number(e.target.value) })}
              />
            </div>
          </div>
          <Button type="submit">Save Settings</Button>
        </form>
        <p className="demo-hint mt-2">Phase 2: settings server-side (D1) save hongi aur har device par same rahengi.</p>
      </div>

      <div className="card mt-4" style={{ maxWidth: 560 }}>
        <h3 className="mb-2">Danger zone</h3>
        <div className="flex flex-wrap">
          <Button
            variant="outline"
            onClick={() => {
              if (window.confirm('Saara local data (courses, lessons, sentences, progress) reset ho jaayega. Confirm?')) {
                resetDB();
                progressService.resetProgress();
                toast('Saara mock data reset ho gaya.', 'info');
              }
            }}
          >
            Reset all mock data
          </Button>
        </div>
      </div>
    </div>
  );
}
