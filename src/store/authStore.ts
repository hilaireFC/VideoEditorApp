// src/store/authStore.ts
import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isInitializing: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  setInitializing: (initializing: boolean) => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: false,
  isInitializing: true,
  error: null,

  setUser: (user) => set({ user }),
  setSession: (session) => set({ session, user: session?.user ?? null }),
  setError: (error) => set({ error }),
  setLoading: (isLoading) => set({ isLoading }),
  setInitializing: (isInitializing) => set({ isInitializing }),

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      set({ user: data.user, session: data.session, isLoading: false });
      return true;
    } catch (e: any) {
      set({ error: e.message || 'Échec de la connexion', isLoading: false });
      return false;
    }
  },

  register: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      set({ user: data.user, session: data.session, isLoading: false });
      return true;
    } catch (e: any) {
      set({ error: e.message || "Échec de l'inscription", isLoading: false });
      return false;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await supabase.auth.signOut();
      set({ user: null, session: null, isLoading: false });
    } catch (e: any) {
      set({ error: e.message || 'Logout failed', isLoading: false });
    }
  },
}));
