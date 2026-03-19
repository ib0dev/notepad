import { useNotes } from '../../hooks/useNotes';

export function Settings() {
  const { settings, updateSetting } = useNotes();

  return (
    <div className="px-5 pb-3">
      <div className="mb-4">
        <span className="text-[11px] font-mono font-semibold tracking-widest uppercase text-shadow dark:text-smoke">
          Settings
        </span>
      </div>

      <div className="space-y-3">
        {/* Auto-delete empty notes toggle */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative flex items-center mt-0.5">
            <input
              type="checkbox"
              checked={settings.autoDeleteEmptyNotes}
              onChange={(e) => updateSetting({ autoDeleteEmptyNotes: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-fog/50 dark:bg-stone rounded-full peer peer-checked:bg-ink dark:peer-checked:bg-fog transition-colors"></div>
            <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white dark:bg-charcoal rounded-full transition-transform peer-checked:translate-x-4 shadow"></div>
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
      </div>
    </div>
  );
}
