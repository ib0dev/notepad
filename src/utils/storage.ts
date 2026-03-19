import { Note, Folder } from '../types/note';

const NOTES_KEY = 'minimal-notepad-notes';
const FOLDERS_KEY = 'minimal-notepad-folders';

export function loadNotes(): Note[] {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    if (!raw) return [];
    const notes = JSON.parse(raw) as Note[];
    // Ensure all notes have folderId and pinned properties
    return notes.map(note => ({
      ...note,
      folderId: note.folderId ?? null,
      pinned: note.pinned ?? false,
    }));
  } catch {
    return [];
  }
}

export function saveNotes(_: Note[]): void {
  // Silently skip localStorage write for note/folder data in Supabase mode.
}

export function loadFolders(): Folder[] {
  try {
    const raw = localStorage.getItem(FOLDERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Folder[];
  } catch {
    return [];
  }
}

export function saveFolders(_: Folder[]): void {
  // Silently skip localStorage write for note/folder data in Supabase mode.
}

const FOLDER_COLORS = [
  '#9B9691', // gray
  '#E07A5F', // terracotta
  '#81B294', // sage green
  '#57837B', // teal
  '#D4A59A', // dusty rose
  '#7B9CAB', // slate blue
  '#C9B1A0', // tan
  '#9FA886', // olive
];

export function getRandomFolderColor(): string {
  return FOLDER_COLORS[Math.floor(Math.random() * FOLDER_COLORS.length)];
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const THEME_KEY = 'minimal-notepad-theme';

export function loadTheme(): 'light' | 'dark' {
  try {
    const theme = localStorage.getItem(THEME_KEY);
    if (theme === 'dark' || theme === 'light') return theme;
    return 'light';
  } catch {
    return 'light';
  }
}

export function saveTheme(theme: 'light' | 'dark'): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // storage unavailable
  }
}

const SETTINGS_KEY = 'minimal-notepad-settings';

export type EditorFontSize = 'small' | 'medium' | 'large';

export interface AppSettings {
  autoDeleteEmptyNotes: boolean;
  editorFontSize: EditorFontSize;
}

const DEFAULT_SETTINGS: AppSettings = {
  autoDeleteEmptyNotes: true,
  editorFontSize: 'medium',
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const settings = JSON.parse(raw) as AppSettings;
    return { ...DEFAULT_SETTINGS, ...settings };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // storage unavailable
  }
}
