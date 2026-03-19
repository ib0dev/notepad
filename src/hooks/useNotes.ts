import { create } from 'zustand';
import { Note, Folder } from '../types/note';
import { loadSettings, saveSettings, getRandomFolderColor, generateId } from '../utils/storage';
import {
  fetchNotes,
  fetchFolders,
  createNoteRemote,
  updateNoteRemote,
  deleteNoteRemote,
  createFolderRemote,
  deleteFolderRemote,
} from '../utils/supabaseData';

interface NotesState {
  userId: string | null;
  notes: Note[];
  folders: Folder[];
  activeId: string | null;
  selectedFolderId: string | null;
  draggedNoteId: string | null;
  searchQuery: string;
  settings: AppSettings;
  sortBy: 'updated' | 'created' | 'title';
  syncStatus: 'syncing' | 'saved' | 'error';
  syncError: string | null;

  setUserId: (userId: string | null) => void;
  loadRemoteData: (userId: string) => Promise<void>;
  clearAll: () => void;
  setSyncError: (message: string | null) => void;

  createNote: () => void;
  updateNote: (id: string, patch: Partial<Pick<Note, 'title' | 'content' | 'pinned' | 'folderId'>>) => void;
  deleteNote: (id: string) => void;
  selectNote: (id: string) => void;
  setSearch: (q: string) => void;
  moveNoteToFolder: (noteId: string, folderId: string | null) => void;
  setDraggedNote: (id: string | null) => void;
  updateSetting: (patch: Partial<AppSettings>) => void;
  setSortBy: (sortBy: 'updated' | 'created' | 'title') => void;
  createFolder: (name: string, color?: string) => void;
  deleteFolder: (id: string) => void;
  renameFolder: (id: string, name: string) => void;
  selectFolder: (id: string | null) => void;

  filteredNotes: () => Note[];
  activeNote: () => Note | undefined;
}

interface AppSettings {
  autoDeleteEmptyNotes: boolean;
  editorFontSize: 'small' | 'medium' | 'large';
}

const updateNoteTimers = new Map<string, ReturnType<typeof setTimeout>>();

export const useNotes = create<NotesState>((set, get) => ({
  userId: null,
  notes: [],
  folders: [],
  activeId: null,
  selectedFolderId: null,
  draggedNoteId: null,
  searchQuery: '',
  settings: loadSettings(),
  sortBy: 'updated',
  syncStatus: 'saved',
  syncError: null,

  setUserId: (userId) => set({ userId }),

  setSyncError: (message) => set({ syncError: message, syncStatus: message ? 'error' : 'saved' }),

  clearAll: () => set({ notes: [], folders: [], activeId: null, selectedFolderId: null, draggedNoteId: null, searchQuery: '' }),

  loadRemoteData: async (userId) => {
    set({ syncStatus: 'syncing', syncError: null });
    try {
      const [folders, notes] = await Promise.all([fetchFolders(userId), fetchNotes(userId)]);
      set({ folders, notes, activeId: notes[0]?.id ?? null, syncStatus: 'saved', syncError: null });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to sync remote data';
      set({ syncStatus: 'error', syncError: message });
      console.error('loadRemoteData', error);
    }
  },

  createNote: () => {
    const userId = get().userId;
    const now = Date.now();
    const tempId = generateId();
    const folderId = get().selectedFolderId;

    const note: Note = { id: tempId, title: '', content: '', createdAt: now, updatedAt: now, folderId, pinned: false };
    set((state) => ({ notes: [note, ...state.notes], activeId: tempId }));

    if (!userId) return;

    createNoteRemote({ ...note }, userId)
      .then((remoteNote) => {
        set((state) => {
          const notes = state.notes.map((n) => (n.id === tempId ? remoteNote : n));
          return { notes, activeId: remoteNote.id };
        });
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : 'Failed to create note';
        get().setSyncError(message);
        console.error('createNote', error);
      });
  },

  updateNote: (id, patch) => {
    const noteExists = get().notes.some((n) => n.id === id);
    if (!noteExists) return;

    set((state) => {
      const notes = state.notes.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n));
      return { notes, syncStatus: 'syncing', syncError: null };
    });

    const userId = get().userId;
    if (!userId) return;

    const existingTimer = updateNoteTimers.get(id);
    if (existingTimer) clearTimeout(existingTimer);

    const timer = setTimeout(async () => {
      const note = get().notes.find((n) => n.id === id);
      if (!note) return;
      try {
        await updateNoteRemote(id, {
          title: note.title,
          content: note.content,
          pinned: note.pinned,
          folderId: note.folderId,
        });
        set({ syncStatus: 'saved', syncError: null });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update note';
        set({ syncStatus: 'error', syncError: message });
        console.error('updateNote', error);
      }
    }, 300);

    updateNoteTimers.set(id, timer);
  },

  deleteNote: (id) => {
    const noteToDelete = get().notes.find((n) => n.id === id);
    set((state) => {
      const notes = state.notes.filter((n) => n.id !== id);
      const activeId = state.activeId === id ? notes[0]?.id ?? null : state.activeId;
      return { notes, activeId, syncStatus: 'syncing', syncError: null };
    });

    const userId = get().userId;
    if (!userId || !noteToDelete) return;

    deleteNoteRemote(id)
      .then(() => set({ syncStatus: 'saved', syncError: null }))
      .catch((error) => {
        const message = error instanceof Error ? error.message : 'Failed to delete note';
        set({ syncStatus: 'error', syncError: message });
        console.error('deleteNote', error);
        set((state) => ({ notes: [...state.notes, noteToDelete] }));
      });
  },

  selectNote: (id) => set({ activeId: id }),

  setSearch: (q) => set({ searchQuery: q }),

  setDraggedNote: (id) => set({ draggedNoteId: id }),

  moveNoteToFolder: (noteId, folderId) => {
    get().updateNote(noteId, { folderId });
  },

  createFolder: (name, color) => {
    const userId = get().userId;
    const folder: Folder = { id: generateId(), name, color: color || getRandomFolderColor() };

    set((state) => ({ folders: [...state.folders, folder], syncStatus: 'syncing', syncError: null }));

    if (!userId) return;

    createFolderRemote(folder, userId)
      .then((remoteFolder) => {
        set((state) => ({ folders: state.folders.map((f) => (f.id === folder.id ? remoteFolder : f)), syncStatus: 'saved', syncError: null }));
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : 'Failed to create folder';
        set({ syncStatus: 'error', syncError: message });
        console.error('createFolder', error);
      });
  },

  deleteFolder: (id) => {
    const previousFolders = get().folders;
    const previousNotes = get().notes;

    set((state) => {
      const folders = state.folders.filter((f) => f.id !== id);
      const notes = state.notes.map((n) => (n.folderId === id ? { ...n, folderId: null } : n));
      return { folders, notes, syncStatus: 'syncing', syncError: null };
    });

    const userId = get().userId;
    if (!userId) return;

    deleteFolderRemote(id)
      .then(() => set({ syncStatus: 'saved', syncError: null }))
      .catch((error) => {
        const message = error instanceof Error ? error.message : 'Failed to delete folder';
        set({ folders: previousFolders, notes: previousNotes, syncStatus: 'error', syncError: message });
        console.error('deleteFolder', error);
      });
  },

  renameFolder: (id, name) => {
    set((state) => ({ folders: state.folders.map((f) => (f.id === id ? { ...f, name } : f)) }));
    // Optional remote folder rename can be added once API supports it.
  },

  selectFolder: (id) => set({ selectedFolderId: id }),

  updateSetting: (patch) => {
    set((state) => {
      const settings = { ...state.settings, ...patch };
      saveSettings(settings);
      return { settings };
    });
  },

  setSortBy: (sortBy) => set({ sortBy }),

  filteredNotes: () => {
    const { notes, searchQuery, selectedFolderId, sortBy } = get();
    let filtered = notes;

    if (selectedFolderId) {
      filtered = filtered.filter((n) => n.folderId === selectedFolderId);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
    }

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
      return b.updatedAt - a.updatedAt;
    });

    return sorted;
  },

  activeNote: () => {
    const { notes, activeId } = get();
    return notes.find((n) => n.id === activeId);
  },
}));
