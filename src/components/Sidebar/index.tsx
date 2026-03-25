import { useState } from 'react';
import { SearchBar } from './SearchBar';
import { NoteList } from './NoteList';
import { FolderList } from './FolderList';
import { SettingsModal } from './SettingsModal';
import { useNotes } from '../../hooks/useNotes';
import { TEMPLATES } from '../../utils/templates';
import { TemplateModal } from './TemplateModal';

export function Sidebar() {
  const { createNote } = useNotes();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  return (
    <aside className={`${isCollapsed ? 'w-[64px]' : 'w-[234px]'} transition-all duration-300 flex-shrink-0 h-full flex flex-col border-r border-mist bg-sand dark:bg-charcoal dark:border-stone`}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        {!isCollapsed && (
          <span className="text-[12px] font-mono font-semibold tracking-widest uppercase text-shadow dark:text-fog">
            Notes
          </span>
        )}
        <div className="flex items-center gap-2">
          {!isCollapsed && (
            <>
              <button
                onClick={() => setIsSettingsOpen(true)}
                title="Settings"
                className="w-7 h-7 flex items-center justify-center rounded
                           text-shadow hover:text-ink transition-colors duration-150 dark:text-fog dark:hover:text-smoke"
              >
                <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
                  <path d="M8 11C9.65685 11 11 9.65685 11 8C11 6.34315 9.65685 5 8 5C6.34315 5 5 6.34315 5 8C5 9.65685 6.34315 11 8 11Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  <path d="M14 8C14 7.5 13.95 7 13.87 6.5L15.5 5.5L14 3L12.5 3.5C12.05 3.2 11.57 2.95 11.07 2.75L10.5 1H7.5L6.93 2.75C6.43 2.95 5.95 3.2 5.5 3.5L4 3L2.5 5.5L4.13 6.5C4.05 7 4 7.5 4 8C4 8.5 4.05 9 4.13 9.5L2.5 10.5L4 13L5.5 12.5C5.95 12.8 6.43 13.05 6.93 13.25L7.5 15H10.5L11.07 13.25C11.57 13.05 12.05 12.8 12.5 12.5L14 13L15.5 10.5L13.87 9.5C13.95 9 14 8.5 14 8Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </button>
              <button
                onClick={() => setShowTemplateModal(true)}
                title="New note"
                aria-label="New note"
                className="w-7 h-7 flex items-center justify-center rounded
             text-shadow hover:text-ink transition-colors duration-150 dark:text-fog dark:hover:text-smoke"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 5V19M5 12H19"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="w-7 h-7 flex items-center justify-center rounded
                       text-shadow hover:text-ink transition-colors duration-150 dark:text-fog dark:hover:text-smoke"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <path d={isCollapsed ? "M9 18L15 12L9 6" : "M15 18L9 12L15 6"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          <FolderList />
          <SearchBar />
          <NoteList />
        </>
      )}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      {showTemplateModal && (
        <TemplateModal
          templates={TEMPLATES}
          onClose={() => setShowTemplateModal(false)}
          onCreateNote={createNote}
        />
      )}
    </aside>
  );
}
