import { supabase } from '../lib/supabase';
import { Note, Folder } from '../types/note';

function fromSnakeToCamelNote(row: any): Note {
  return {
    id: row.id,
    title: row.title ?? '',
    content: row.content ?? '',
    folderId: row.folder_id ?? null,
    pinned: row.pinned ?? false,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
  };
}

function fromSnakeToCamelFolder(row: any): Folder {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
  };
}

export async function fetchNotes(userId: string): Promise<Note[]> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw new Error(`fetchNotes failed: ${error.message}`);
  if (!data) return [];

  return (data as any[]).map(fromSnakeToCamelNote);
}

export async function createNoteRemote(note: Note, userId: string): Promise<Note> {
  const { data, error } = await supabase.from('notes').insert([{
    user_id: userId,
    folder_id: note.folderId,
    title: note.title,
    content: note.content,
    pinned: note.pinned ?? false,
  }]).select().single();

  if (error) throw new Error(`createNoteRemote failed: ${error.message}`);
  if (!data) throw new Error('createNoteRemote failed: no data returned');

  return fromSnakeToCamelNote(data);
}

export async function updateNoteRemote(noteId: string, changes: Partial<Note>): Promise<void> {
  const payload: any = {};
  if (changes.title !== undefined) payload.title = changes.title;
  if (changes.content !== undefined) payload.content = changes.content;
  if (changes.folderId !== undefined) payload.folder_id = changes.folderId;
  if (changes.pinned !== undefined) payload.pinned = changes.pinned;

  const { error } = await supabase.from('notes').update(payload).eq('id', noteId);
  if (error) throw new Error(`updateNoteRemote failed: ${error.message}`);
}

export async function deleteNoteRemote(noteId: string): Promise<void> {
  const { error } = await supabase.from('notes').delete().eq('id', noteId);
  if (error) throw new Error(`deleteNoteRemote failed: ${error.message}`);
}

export async function fetchFolders(userId: string): Promise<Folder[]> {
  const { data, error } = await supabase
    .from('folders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(`fetchFolders failed: ${error.message}`);
  if (!data) return [];

  return (data as any[]).map(fromSnakeToCamelFolder);
}

export async function createFolderRemote(folder: Folder, userId: string): Promise<Folder> {
  const { data, error } = await supabase.from('folders').insert([{
    user_id: userId,
    name: folder.name,
    color: folder.color,
  }]).select().single();

  if (error) throw new Error(`createFolderRemote failed: ${error.message}`);
  if (!data) throw new Error('createFolderRemote failed: no data returned');

  return fromSnakeToCamelFolder(data);
}

export async function deleteFolderRemote(folderId: string): Promise<void> {
  const { error } = await supabase.from('folders').delete().eq('id', folderId);
  if (error) throw new Error(`deleteFolderRemote failed: ${error.message}`);
}
