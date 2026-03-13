import { create } from 'zustand';
import { Note, Folder } from '../types/note';
import { loadNotes, saveNotes, generateId, loadFolders, saveFolders, getRandomFolderColor, loadSettings, saveSettings, AppSettings } from '../utils/storage';

interface NotesState {
  notes: Note[];
  folders: Folder[];
  activeId: string | null;
  selectedFolderId: string | null;
  draggedNoteId: string | null;
  searchQuery: string;
  settings: AppSettings;
  sortBy: 'updated' | 'created' | 'title';

  // actions
  createNote: () => void;
  updateNote: (id: string, patch: Partial<Pick<Note, 'title' | 'content'>>) => void;
  deleteNote: (id: string) => void;
  selectNote: (id: string) => void;
  setSearch: (q: string) => void;
  moveNoteToFolder: (noteId: string, folderId: string | null) => void;
  setDraggedNote: (id: string | null) => void;
  updateSetting: (patch: Partial<AppSettings>) => void;
  setSortBy: (sortBy: 'updated' | 'created' | 'title') => void;
  
  // folder actions
  createFolder: (name: string, color?: string) => void;
  deleteFolder: (id: string) => void;
  renameFolder: (id: string, name: string) => void;
  selectFolder: (id: string | null) => void;

  // derived
  filteredNotes: () => Note[];
  activeNote: () => Note | undefined;
}

export const useNotes = create<NotesState>((set, get) => ({
  notes: loadNotes().sort((a, b) => b.updatedAt - a.updatedAt),
  folders: loadFolders(),
  activeId: loadNotes().sort((a, b) => b.updatedAt - a.updatedAt)[0]?.id ?? null,
  selectedFolderId: null,
  draggedNoteId: null,
  searchQuery: '',
  settings: loadSettings(),
   sortBy: 'updated',

  createNote: () => {
    const note: Note = {
      id: generateId(),
      title: '',
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      folderId: get().selectedFolderId,
      pinned: false,
    };
    set((s) => {
      const updated = [note, ...s.notes];
      saveNotes(updated);
      return { notes: updated, activeId: note.id };
    });
  },

  updateNote: (id, patch) => {
    set((s) => {
      const updated = s.notes.map((n) =>
        n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n
      );
      saveNotes(updated);
      return { notes: updated };
    });
  },

  deleteNote: (id) => {
    set((s) => {
      const updated = s.notes.filter((n) => n.id !== id);
      saveNotes(updated);
      const newActive =
        s.activeId === id ? (updated[0]?.id ?? null) : s.activeId;
      return { notes: updated, activeId: newActive };
    });
  },

  selectNote: (id) => set({ activeId: id }),

  setSearch: (q) => set({ searchQuery: q }),

  setDraggedNote: (id) => set({ draggedNoteId: id }),

  moveNoteToFolder: (noteId, folderId) => {
    set((s) => {
      const updated = s.notes.map((n) =>
        n.id === noteId ? { ...n, folderId, updatedAt: Date.now() } : n
      );
      saveNotes(updated);
      return { notes: updated };
    });
  },

  createFolder: (name, color) => {
    const folder: Folder = {
      id: generateId(),
      name,
      color: color || getRandomFolderColor(),
    };
    set((s) => {
      const updated = [...s.folders, folder];
      saveFolders(updated);
      return { folders: updated };
    });
  },

  deleteFolder: (id) => {
    set((s) => {
      const updated = s.folders.filter((f) => f.id !== id);
      const notesUpdated = s.notes.map((n) =>
        n.folderId === id ? { ...n, folderId: null } : n
      );
      saveFolders(updated);
      saveNotes(notesUpdated);
      return { folders: updated, notes: notesUpdated };
    });
  },

  renameFolder: (id, name) => {
    set((s) => {
      const updated = s.folders.map((f) =>
        f.id === id ? { ...f, name } : f
      );
      saveFolders(updated);
      return { folders: updated };
    });
  },

  selectFolder: (id) => set({ selectedFolderId: id }),

  updateSetting: (patch) => {
    set((s) => {
      const updated = { ...s.settings, ...patch };
      saveSettings(updated);
      return { settings: updated };
    });
  },

  setSortBy: (sortBy) => set({ sortBy }),

  filteredNotes: () => {
    const { notes, searchQuery, selectedFolderId, sortBy } = get();
    let filtered = notes;
    
    // Filter by folder if selected
    if (selectedFolderId) {
      filtered = filtered.filter(n => n.folderId === selectedFolderId);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q)
      );
    }
    // Sort: pinned first, then by chosen field
    const sorted = [...filtered].sort((a, b) => {
      const aPinned = !!a.pinned;
      const bPinned = !!b.pinned;
      if (aPinned !== bPinned) return aPinned ? -1 : 1;

      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }

      if (sortBy === 'created') {
        return b.createdAt - a.createdAt;
      }

      // default: updated
      return b.updatedAt - a.updatedAt;
    });

    return sorted;
  },

  activeNote: () => {
    const { notes, activeId } = get();
    return notes.find((n) => n.id === activeId);
  },
}));
