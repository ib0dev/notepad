import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNotes } from '../../hooks/useNotes';

export function FolderList() {
  const { folders, selectedFolderId, selectFolder, createFolder, deleteFolder, moveNoteToFolder, draggedNoteId } = useNotes();
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);

  const handleCreate = () => {
    if (!newFolderName.trim()) return;
    createFolder(newFolderName.trim());
    setNewFolderName('');
    setIsCreating(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreate();
    } else if (e.key === 'Escape') {
      setIsCreating(false);
      setNewFolderName('');
    }
  };

  const handleDragOver = (e: React.DragEvent, folderId: string | null) => {
    e.preventDefault();
    setDragOverFolder(folderId);
  };

  const handleDragLeave = () => {
    setDragOverFolder(null);
  };

  const handleDrop = (e: React.DragEvent, folderId: string | null) => {
    e.preventDefault();
    setDragOverFolder(null);
    
    if (draggedNoteId && folderId !== draggedNoteId) {
      moveNoteToFolder(draggedNoteId, folderId);
    }
  };

  return (
    <div className="px-5 pb-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono font-semibold tracking-widest uppercase text-shadow dark:text-smoke">
          Folders
        </span>
        <button
          onClick={() => setIsCreating(true)}
          title="New folder"
          className="w-5 h-5 flex items-center justify-center rounded text-[10px]
                     text-shadow hover:text-ink transition-colors duration-150 dark:text-smoke dark:hover:text-fog"
        >
          <svg width="10" height="10" viewBox="0 0 8 8" fill="none">
            <line x1="4" y1="1" x2="4" y2="7" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
            <line x1="1" y1="4" x2="7" y2="4" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {isCreating && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2"
        >
          <input
            autoFocus
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onBlur={() => !newFolderName.trim() && setIsCreating(false)}
            onKeyDown={handleKeyDown}
            placeholder="Folder name..."
            className="w-full bg-transparent text-[10px] font-mono text-ink placeholder-shadow
                       border-b border-mist focus:border-fog outline-none py-1
                       transition-colors duration-200 tracking-wide dark:text-fog dark:border-stone dark:focus:border-ash"
          />
        </motion.div>
      )}

      <div
        onClick={() => selectFolder(null)}
        onDragOver={(e) => handleDragOver(e, null)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, null)}
        className={`
          mb-0.5 px-3 py-1.5 rounded-md cursor-pointer
          transition-colors duration-150 text-[10px] font-mono tracking-wide
          ${selectedFolderId === null ? 'bg-white dark:bg-stone' : 'hover:bg-white/50 dark:hover:bg-stone/30'}
          ${dragOverFolder === null ? 'bg-fog/30 dark:bg-ash/30 border-2 border-dashed border-shadow' : ''}
        `}
      >
        All Notes
      </div>

      {folders.map((folder) => (
        <motion.div
          key={folder.id}
          layout
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          onClick={() => selectFolder(folder.id)}
          onDragOver={(e) => handleDragOver(e, folder.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, folder.id)}
          className={`
            group flex items-center justify-between mb-0.5 px-3 py-1.5 rounded-md cursor-pointer
            transition-colors duration-150 text-[10px] font-mono tracking-wide
            ${selectedFolderId === folder.id ? 'bg-white dark:bg-stone' : 'hover:bg-white/50 dark:hover:bg-stone/30'}
            ${dragOverFolder === folder.id ? 'bg-fog/30 dark:bg-ash/30 border-2 border-dashed border-shadow' : ''}
          `}
        >
          <div className="flex items-center gap-2 flex-1">
            <div
              className="w-2 h-2 rounded-sm"
              style={{ backgroundColor: folder.color }}
            />
            <span className="truncate">{folder.name}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Delete this folder? Notes will be moved to All Notes.')) {
                deleteFolder(folder.id);
              }
            }}
            className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center
                       text-shadow/60 hover:text-red-400 transition-opacity duration-150 dark:text-smoke"
            title="Delete folder"
          >
            <svg width="8" height="8" viewBox="0 0 6 6" fill="none">
              <path d="M1 1L5 5M5 1L1 5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
            </svg>
          </button>
        </motion.div>
      ))}
    </div>
  );
}
