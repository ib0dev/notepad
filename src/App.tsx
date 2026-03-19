import { useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { useNotes } from './hooks/useNotes';
import { useAuth } from './hooks/useAuth';
import { AuthPage } from './components/Auth/AuthPage';

function getPlainTextFromHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .trim();
}

export default function App() {
  const { activeId, notes, settings, deleteNote, syncStatus, syncError } = useNotes();
  const { user, loading, initAuth, signOut } = useAuth();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (!settings.autoDeleteEmptyNotes) return;

    const checkEmptyNotes = () => {
      const now = Date.now();
      notes.forEach((note) => {
        const isEmpty = !note.title.trim() && !getPlainTextFromHtml(note.content);
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

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-sand dark:bg-charcoal">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-sand dark:bg-charcoal font-mono overflow-hidden select-none">
      <header className="flex justify-between items-center px-4 py-2 bg-sand dark:bg-charcoal border-b border-mist dark:border-stone">
        <div></div>
        {user && (
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
            <span className="truncate max-w-48">{user.email}</span>
            <button
              onClick={signOut}
              className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-300 dark:hover:text-indigo-200"
            >
              Sign Out
            </button>
          </div>
        )}
      </header>
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 flex flex-col h-full overflow-hidden select-text relative">
          <div className="absolute right-3 top-3 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 z-50">
            <span className={syncStatus === 'saved' ? 'text-emerald-500' : syncStatus === 'syncing' ? 'text-gray-500' : 'text-red-500'}>
              •
            </span>
            {syncStatus === 'syncing' ? 'Syncing...' : syncStatus === 'saved' ? 'Saved' : `Sync error: ${syncError}`}
          </div>
          <Editor />
        </main>
      </div>
    </div>
  );
}
