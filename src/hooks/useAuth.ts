import { create } from 'zustand';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useNotes } from './useNotes';
import { migrateLocalStorageToSupabase } from '../utils/migrate';

let notesRealtimeChannel: any = null;

const mapRemoteNote = (row: any) => ({
  id: row.id,
  title: row.title ?? '',
  content: row.content ?? '',
  folderId: row.folder_id ?? null,
  pinned: row.pinned ?? false,
  createdAt: new Date(row.created_at).getTime(),
  updatedAt: new Date(row.updated_at).getTime(),
});

const initializeRealtime = (userId: string) => {
  if (notesRealtimeChannel) {
    supabase.removeChannel(notesRealtimeChannel);
    notesRealtimeChannel = null;
  }

  notesRealtimeChannel = supabase
    .channel(`notes-changes-${userId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'notes', filter: `user_id=eq.${userId}` },
      (payload: any) => {
        const note = mapRemoteNote(payload.record ?? payload.new ?? payload.old);
        if (!note) return;

        if (payload.eventType === 'INSERT') {
          useNotes.setState({ syncError: null });
          useNotes.setState({ notes: [note, ...useNotes.getState().notes] });
        }

        if (payload.eventType === 'UPDATE') {
          useNotes.setState({
            notes: useNotes.getState().notes.map((n) => (n.id === note.id ? note : n)),
          });
        }

        if (payload.eventType === 'DELETE') {
          useNotes.setState({
            notes: useNotes.getState().notes.filter((n) => n.id !== note.id),
          });
        }
      }
    )
    .subscribe();
};

const cleanupRealtime = () => {
  if (notesRealtimeChannel) {
    supabase.removeChannel(notesRealtimeChannel);
    notesRealtimeChannel = null;
  }
};

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  initAuth: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  error: null,

  signUp: async (email, password) => {
    set({ loading: true, error: null });
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      set({ error: error.message, loading: false });
      throw error;
    }

    const session = data.session ?? null;
    const user = data.user ?? null;

    set({ user, session, loading: false, error: null });

    if (user) {
      useNotes.getState().setUserId(user.id);
      initializeRealtime(user.id);
      try {
        await migrateLocalStorageToSupabase(user.id);
      } catch (migrateError) {
        console.error('migrateLocalStorageToSupabase', migrateError);
      }
      await useNotes.getState().loadRemoteData(user.id);
    }
  },

  signIn: async (email, password) => {
    set({ loading: true, error: null });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      set({ error: error.message, loading: false });
      throw error;
    }

    const session = data.session ?? null;
    const user = data.user ?? null;

    set({ user, session, loading: false, error: null });

    if (user) {
      useNotes.getState().setUserId(user.id);
      initializeRealtime(user.id);
      try {
        await migrateLocalStorageToSupabase(user.id);
      } catch (migrateError) {
        console.error('migrateLocalStorageToSupabase', migrateError);
      }
      await useNotes.getState().loadRemoteData(user.id);
    }
  },

  signOut: async () => {
    set({ loading: true, error: null });
    const { error } = await supabase.auth.signOut();
    if (error) {
      set({ error: error.message, loading: false });
      throw error;
    }

    cleanupRealtime();
    useNotes.getState().clearAll();
    useNotes.getState().setUserId(null);

    set({ user: null, session: null, loading: false, error: null });
  },

  initAuth: async () => {
    set({ loading: true, error: null });

    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('initAuth getSession error', error);
    }

    const session = data?.session ?? null;
    const user = session?.user ?? null;

    set({ user, session, loading: false, error: null });

    if (user) {
      useNotes.getState().setUserId(user.id);
      await useNotes.getState().loadRemoteData(user.id);
    }

    supabase.auth.onAuthStateChange(async (_event, sessionData) => {
      const updatedSession = sessionData ?? null;
      const updatedUser = sessionData?.user ?? null;

      set({ session: updatedSession, user: updatedUser });

      if (updatedUser) {
        useNotes.getState().setUserId(updatedUser.id);
        initializeRealtime(updatedUser.id);
        await useNotes.getState().loadRemoteData(updatedUser.id);
      } else {
        cleanupRealtime();
        useNotes.getState().clearAll();
        useNotes.getState().setUserId(null);
      }
    });
  },
}));