import { AnimatePresence, motion } from 'framer-motion';
import { NoteItem } from './NoteItem';
import { useNotes } from '../../hooks/useNotes';

export function NoteList() {
  const { filteredNotes, sortBy, setSortBy } = useNotes();
  const notes = filteredNotes();

  return (
    <div className="py-1">
      <div className="px-5 pb-1 flex items-center justify-end">
        <label className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-shadow/80 dark:text-smoke/80 uppercase tracking-wide">
            Sort
          </span>

          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as 'updated' | 'created' | 'title')
            }
            className="text-[10px] font-mono text-shadow/80 bg-transparent border border-mist rounded px-2 py-0.5 cursor-pointer outline-none hover:border-fog transition-colors dark:text-smoke dark:border-stone dark:hover:border-ash"
          >
            <option value="updated">Last edited</option>
            <option value="created">Created</option>
            <option value="title">Title</option>
          </select>
        </label>
      </div>

      <AnimatePresence initial={false}>
        {notes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="px-5 py-3"
          >
            <p className="text-[11px] font-mono text-shadow tracking-wide dark:text-smoke">
              No notes found
            </p>
          </motion.div>
        ) : (
          notes.map((note) => <NoteItem key={note.id} note={note} />)
        )}
      </AnimatePresence>
    </div>
  );
}