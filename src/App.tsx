import { useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { useNotes } from './hooks/useNotes';

function getPlainTextFromHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .trim();
}

export default function App() {
  const { activeId, notes, settings, deleteNote } = useNotes();

  // Auto-delete empty notes after 5 seconds
  useEffect(() => {
    if (!settings.autoDeleteEmptyNotes) return;

    const checkEmptyNotes = () => {
      const now = Date.now();
      notes.forEach((note) => {
        const isEmpty =
          !note.title.trim() && !getPlainTextFromHtml(note.content);
        const isNotActive = note.id !== activeId;
        const isOldEnough = now - note.updatedAt > 5000;

        if (isEmpty && isNotActive && isOldEnough) {
          deleteNote(note.id);
        }
      });
    };

    const interval = setInterval(checkEmptyNotes, 1000);
    return () => clearInterval(interval);
  }, [notes, activeId, settings.autoDeleteEmptyNotes, deleteNote]);

  return (
    <div className="h-screen w-screen flex bg-sand dark:bg-charcoal font-mono overflow-hidden select-none">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden select-text">
        <Editor />
      </main>
    </div>
  );
}
