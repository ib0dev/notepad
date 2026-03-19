import { Note, Folder } from '../types/note';
import { loadNotes, loadFolders, saveNotes, saveFolders } from './storage';
import { createFolderRemote, createNoteRemote } from './supabaseData';

export async function migrateLocalStorageToSupabase(userId: string): Promise<void> {
  try {
    const localNotes = loadNotes();
    const localFolders = loadFolders();

    if (localNotes.length === 0 && localFolders.length === 0) {
      return;
    }

    const folderIdMap = new Map<string, string>();
    const insertedFolders: Folder[] = [];

    for (const folder of localFolders) {
      const newId = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      folderIdMap.set(folder.id, newId);
      const remoteFolder = await createFolderRemote({ ...folder, id: newId }, userId);
      insertedFolders.push(remoteFolder);
    }

    const insertedNotes: Note[] = [];

    for (const note of localNotes) {
      const remoteFolderId = note.folderId ? folderIdMap.get(note.folderId) ?? null : null;
      const remoteNote = await createNoteRemote({ ...note, folderId: remoteFolderId }, userId);
      insertedNotes.push(remoteNote);
    }

    localStorage.removeItem('minimal-notepad-notes');
    localStorage.removeItem('minimal-notepad-folders');

    // Keep local state in case other code expects them, but now remote is source-of-truth
    saveNotes(insertedNotes);
    saveFolders(insertedFolders);
  } catch (error) {
    console.error('migrateLocalStorageToSupabase failed', error);
    // do not delete localStorage on failure by specification
  }
}
