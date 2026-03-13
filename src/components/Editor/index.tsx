import React, { useRef, useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotes } from '../../hooks/useNotes';
import { formatRelativeTime } from '../../utils/time';
import { useTheme } from '../../hooks/useTheme';

export function Editor() {
  const { activeNote, updateNote, deleteNote, activeId, folders, moveNoteToFolder, settings } = useNotes();
  const { theme } = useTheme();
  const note = activeNote();

  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [, forceUpdate] = useState(0);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [activeColor, setActiveColor] = useState<
    'primary' | 'terracotta' | 'teal' | 'sage' | 'blue' | 'rose'
    | null
  >(null);

  // Re-render every 30s to keep relative time fresh
  useEffect(() => {
    const id = setInterval(() => forceUpdate((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  // Focus title on new note (empty title)
  useEffect(() => {
    if (note && !note.title && titleRef.current) {
      titleRef.current.focus();
    }
  }, [activeId]);

  // Sync editor content only when switching notes
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.innerHTML = note?.content || '';
    }
  }, [note?.id]);

  // Ensure formatting uses CSS spans (more consistent)
  useEffect(() => {
    try {
      document.execCommand('styleWithCSS', false, 'true');
    } catch {
      // ignore if not supported
    }
  }, []);

  const handleTitle = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!note) return;
      updateNote(note.id, { title: e.target.value });
    },
    [note, updateNote]
  );

  const handleContentInput = useCallback(
    (e: React.FormEvent<HTMLDivElement>) => {
      if (!note) return;
      const html = (e.currentTarget as HTMLDivElement).innerHTML;
      updateNote(note.id, { content: html });
    },
    [note, updateNote]
  );

  const applyFormat = useCallback(
    (command: 'bold' | 'italic' | 'underline' | 'foreColor', value?: string) => {
      if (!note) return;
      document.execCommand(command, false, value);
      if (contentRef.current) {
        updateNote(note.id, { content: contentRef.current.innerHTML });
      }
    },
    [note, updateNote]
  );

  const handleDelete = useCallback(() => {
    if (!note) return;
    if (confirm('Delete this note?')) deleteNote(note.id);
  }, [note, deleteNote]);

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-[11px] font-mono text-shadow tracking-widest uppercase dark:text-smoke">
          No note selected
        </p>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={note.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15, ease: 'easeInOut' }}
        className="flex-1 flex flex-col h-full overflow-hidden"
      >
        {/* Toolbar */}
        <div className="flex items-center justify-between px-10 pt-7 pb-3">
          <div className="flex items-center gap-4">
            <span className="text-[9px] font-mono text-shadow tracking-widest uppercase dark:text-smoke">
              Last edited {formatRelativeTime(note.updatedAt)}
            </span>
            <div className="relative group">
              <select
                value={note.folderId || ''}
                onChange={(e) => moveNoteToFolder(note.id, e.target.value || null)}
                className="text-[9px] font-mono text-shadow/80 bg-transparent border border-mist rounded
                           px-2 py-0.5 cursor-pointer outline-none hover:border-fog transition-colors
                           dark:text-smoke dark:border-stone dark:hover:border-ash"
              >
                <option value="">All Notes</option>
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={handleDelete}
            title="Delete note"
            className="text-[11px] font-mono text-shadow/60 hover:text-red-400
                       px-4 py-2 rounded transition-colors duration-150 dark:text-smoke dark:hover:text-red-400"
          >
            Delete
          </button>
        </div>

        {/* Title */}
        <div className="px-10 pb-2">
          <input
            ref={titleRef}
            type="text"
            value={note.title}
            onChange={handleTitle}
            placeholder="Untitled"
            className={`w-full bg-transparent font-mono font-semibold
                       text-ink placeholder-mist outline-none tracking-tight
                       border-none resize-none leading-snug dark:text-fog dark:placeholder-ash
                       ${
                         settings.editorFontSize === 'small'
                           ? 'text-lg'
                           : settings.editorFontSize === 'large'
                           ? 'text-2xl'
                           : 'text-xl'
                       }`}
          />
        </div>

        {/* Formatting toolbar */}
        <div className="mx-10 mb-2 flex items-center gap-2">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              setIsBold((prev) => !prev);
              applyFormat('bold');
            }}
            className={`px-2 py-1 rounded border text-[10px] font-mono tracking-wide transition-colors
              ${
                isBold
                  ? 'border-ink bg-ink text-sand dark:border-fog dark:bg-fog dark:text-charcoal'
                  : 'border-mist text-shadow hover:border-ink hover:text-ink dark:border-stone dark:text-smoke dark:hover:border-fog dark:hover:text-fog'
              }`}
          >
            B
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              setIsItalic((prev) => !prev);
              applyFormat('italic');
            }}
            className={`px-2 py-1 rounded border text-[10px] font-mono tracking-wide transition-colors
              ${
                isItalic
                  ? 'border-ink bg-ink text-sand dark:border-fog dark:bg-fog dark:text-charcoal'
                  : 'border-mist text-shadow hover:border-ink hover:text-ink dark:border-stone dark:text-smoke dark:hover:border-fog dark:hover:text-fog'
              }`}
          >
            I
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              setIsUnderline((prev) => !prev);
              applyFormat('underline');
            }}
            className={`px-2 py-1 rounded border text-[10px] font-mono tracking-wide transition-colors
              ${
                isUnderline
                  ? 'border-ink bg-ink text-sand dark:border-fog dark:bg-fog dark:text-charcoal'
                  : 'border-mist text-shadow hover:border-ink hover:text-ink dark:border-stone dark:text-smoke dark:hover:border-fog dark:hover:text-fog'
              }`}
          >
            U
          </button>
          <div className="ml-3 flex items-center gap-1">
            <span className="text-[9px] font-mono text-shadow dark:text-smoke mr-1">
              Color
            </span>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                setActiveColor('primary');
                const color = theme === 'dark' ? '#F9FAFB' : '#1F2933';
                applyFormat('foreColor', color);
              }}
              className={`w-4 h-4 rounded-full border border-mist bg-ink/90 dark:bg-fog/90
                ${
                  activeColor === 'primary'
                    ? 'ring-2 ring-white dark:ring-fog'
                    : ''
                }`}
            />
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                setActiveColor('terracotta');
                applyFormat('foreColor', '#E07A5F');
              }}
              className={`w-4 h-4 rounded-full border border-mist
                ${
                  activeColor === 'terracotta'
                    ? 'ring-2 ring-white dark:ring-fog'
                    : ''
                }`}
              style={{ backgroundColor: '#E07A5F' }}
            />
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                setActiveColor('teal');
                applyFormat('foreColor', '#57837B');
              }}
              className={`w-4 h-4 rounded-full border border-mist
                ${
                  activeColor === 'teal'
                    ? 'ring-2 ring-white dark:ring-fog'
                    : ''
                }`}
              style={{ backgroundColor: '#57837B' }}
            />
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                setActiveColor('sage');
                applyFormat('foreColor', '#81B294');
              }}
              className={`w-4 h-4 rounded-full border border-mist
                ${
                  activeColor === 'sage'
                    ? 'ring-2 ring-white dark:ring-fog'
                    : ''
                }`}
              style={{ backgroundColor: '#81B294' }}
            />
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                setActiveColor('blue');
                applyFormat('foreColor', '#7B9CAB');
              }}
              className={`w-4 h-4 rounded-full border border-mist
                ${
                  activeColor === 'blue'
                    ? 'ring-2 ring-white dark:ring-fog'
                    : ''
                }`}
              style={{ backgroundColor: '#7B9CAB' }}
            />
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                setActiveColor('rose');
                applyFormat('foreColor', '#D4A59A');
              }}
              className={`w-4 h-4 rounded-full border border-mist
                ${
                  activeColor === 'rose'
                    ? 'ring-2 ring-white dark:ring-fog'
                    : ''
                }`}
              style={{ backgroundColor: '#D4A59A' }}
            />
          </div>
        </div>

        {/* Divider */}
        <div className="mx-10 mb-3 h-px bg-mist dark:bg-stone" />

        {/* Content */}
        <div
          ref={contentRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleContentInput}
          spellCheck
          className={`flex-1 mx-10 mb-10 bg-transparent font-mono
                     text-ink/90 outline-none resize-none
                     leading-relaxed tracking-wide dark:text-fog/90
                     ${
                       settings.editorFontSize === 'small'
                         ? 'text-xs'
                         : settings.editorFontSize === 'large'
                         ? 'text-base'
                         : 'text-sm'
                     }`}
        />
      </motion.div>
    </AnimatePresence>
  );
}
