import { useNotes } from '../../hooks/useNotes';
import { useTheme } from '../../hooks/useTheme';
import type { EditorFontSize } from '../../utils/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FONT_SIZE_OPTIONS: { value: EditorFontSize; label: string }[] = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { settings, updateSetting } = useNotes();
  const { theme, setTheme } = useTheme();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 dark:bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-[340px] max-w-[90vw] rounded-lg border border-mist bg-sand shadow-lg dark:bg-charcoal dark:border-stone"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-mist/60 dark:border-stone/60">
          <span className="text-[11px] font-mono font-semibold tracking-widest uppercase text-shadow dark:text-smoke">
            Settings
          </span>
          <button
            onClick={onClose}
            className="text-[12px] font-mono text-shadow/80 hover:text-ink dark:text-smoke dark:hover:text-fog"
          >
            Close
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Auto-delete empty notes */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex items-center mt-0.5">
              <input
                type="checkbox"
                checked={settings.autoDeleteEmptyNotes}
                onChange={(e) => updateSetting({ autoDeleteEmptyNotes: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-fog/50 dark:bg-stone rounded-full peer peer-checked:bg-ink dark:peer-checked:bg-fog transition-colors" />
              <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white dark:bg-charcoal rounded-full transition-transform peer-checked:translate-x-4 shadow" />
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-mono text-ink dark:text-fog leading-relaxed">
                Auto-delete empty notes
              </p>
              <p className="text-[10px] font-mono text-shadow/80 dark:text-smoke/80 mt-0.5">
                Remove notes with empty title and content after 5 seconds
              </p>
            </div>
          </label>

          {/* Theme selector */}
          <div>
            <p className="text-[11px] font-mono text-ink dark:text-fog mb-1">
              Theme
            </p>
            <div className="flex gap-2">
              {(['light', 'dark'] as const).map((value) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={`flex-1 px-2 py-1 rounded border text-[11px] font-mono tracking-wide transition-colors
                    ${
                      theme === value
                        ? 'border-ink bg-ink text-sand dark:border-fog dark:bg-fog dark:text-charcoal'
                        : 'border-mist text-shadow hover:border-ink hover:text-ink dark:border-stone dark:text-smoke dark:hover:border-fog dark:hover:text-fog'
                    }`}
                >
                  {value === 'light' ? 'Light' : 'Dark'}
                </button>
              ))}
            </div>
          </div>

          {/* Editor font size */}
          <div>
            <p className="text-[11px] font-mono text-ink dark:text-fog mb-1">
              Editor font size
            </p>
            <div className="flex gap-2">
              {FONT_SIZE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateSetting({ editorFontSize: option.value })}
                  className={`flex-1 px-2 py-1 rounded border text-[11px] font-mono tracking-wide transition-colors
                    ${
                      settings.editorFontSize === option.value
                        ? 'border-ink bg-ink text-sand dark:border-fog dark:bg-fog dark:text-charcoal'
                        : 'border-mist text-shadow hover:border-ink hover:text-ink dark:border-stone dark:text-smoke dark:hover:border-fog dark:hover:text-fog'
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

