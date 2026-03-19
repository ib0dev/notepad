import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Note } from '../../types/note';
import { useNotes } from '../../hooks/useNotes';
import { formatRelativeTime } from '../../utils/time';

function getPlainTextFromHtml(html: string): string {
  if (!html) return '';
  return html
    // convert common block breaks to newlines
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    // strip all remaining tags
    .replace(/<[^>]+>/g, '')
    .trim();
}

interface NoteItemProps {
  note: Note;
}

export function NoteItem({ note }: NoteItemProps) {
  const {
    activeId,
    selectNote,
    deleteNote,
    folders,
    setDraggedNote,
    draggedNoteId,
  } = useNotes();
  const [showPreview, setShowPreview] = useState(false);
  const isActive = activeId === note.id;

  const displayTitle = note.title.trim() || 'Untitled';
  const fullContent = getPlainTextFromHtml(note.content);
  const preview = fullContent.replace(/\n/g, ' ').slice(0, 60);
  const folder = note.folderId ? folders.find(f => f.id === note.folderId) : null;

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', note.id);
        e.dataTransfer.effectAllowed = 'move';
        setDraggedNote(note.id);
      }}
      onDragEnd={() => setDraggedNote(null)}
      className={`${draggedNoteId === note.id ? 'opacity-50' : ''}`}
    >
      <motion.div
        layout
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        onClick={() => selectNote(note.id)}
        onMouseEnter={() => fullContent && setShowPreview(true)}
        onMouseLeave={() => setShowPreview(false)}
        className={`
          group mx-2 mb-0.5 px-3 py-2.5 rounded-md cursor-pointer
          transition-colors duration-150 relative
          ${isActive ? 'bg-white dark:bg-stone' : 'hover:bg-white/50 dark:hover:bg-stone/30'}
        `}
      >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-mono tracking-wide truncate leading-snug
            ${isActive ? 'text-ink dark:text-fog' : 'text-ink/80 dark:text-fog/90'}`}>
            {displayTitle}
          </p>
          {folder && (
            <div className="flex items-center gap-1.5 mt-1">
              <div
                className="w-1.5 h-1.5 rounded-sm"
                style={{ backgroundColor: folder.color }}
              />
              <span className="text-[10px] font-mono text-shadow/70 truncate dark:text-smoke/70">
                {folder.name}
              </span>
            </div>
          )}
          {preview && !folder && (
            <p className="text-[11px] font-mono text-shadow truncate mt-0.5 leading-snug dark:text-smoke">
              {preview}
            </p>
          )}
          <div className="flex items-center justify-between mt-1">
            <p className="text-[10px] font-mono text-shadow/70 dark:text-smoke/70">
              {formatRelativeTime(note.updatedAt)}
            </p>
            {note.pinned && (
              <span className="text-[10px] font-mono text-shadow/80 dark:text-smoke/80">
                ★
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              // lazy import of store to avoid circular types isn't needed; useNotes already in scope
              useNotes.getState().notes &&
                useNotes.setState((state) => ({
                  notes: state.notes.map((n) =>
                    n.id === note.id ? { ...n, pinned: !n.pinned } : n
                  ),
                }));
            }}
            className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded
                       text-shadow/60 hover:text-ink hover:bg-white/60 dark:hover:bg-stone/40
                       transition-all duration-150 dark:text-smoke text-[11px]"
            title={note.pinned ? 'Unpin note' : 'Pin note'}
          >
            {note.pinned ? '★' : '☆'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Delete this note?')) deleteNote(note.id);
            }}
            className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded
                       text-shadow/60 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20
                       transition-all duration-150 dark:text-smoke"
            title="Delete note"
          >
            <svg width="11" height="11" viewBox="0 0 10 10" fill="none">
              <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Hover Preview */}
      <AnimatePresence>
        {showPreview && fullContent && (
          <motion.div
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute left-full top-0 ml-2 z-50"
          >
            <div className="bg-sand dark:bg-charcoal border border-mist dark:border-stone rounded-md p-3 shadow-lg">
              <p className="text-[11px] font-mono text-ink/90 dark:text-fog/90 leading-relaxed whitespace-pre-wrap break-words max-h-40 overflow-y-auto scrollbar-none">
                {fullContent}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </motion.div>
    </div>
  );
}

