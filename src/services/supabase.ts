// src/services/supabase.ts
// ⚠️ Remplacez ces valeurs par celles de votre projet Supabase
// Dashboard → Project Settings → API
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';

const SUPABASE_URL = 'https://gknymeswzqvsklzmadnc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrbnltZXN3enF2c2tsem1hZG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxODI2NjAsImV4cCI6MjA5NTc1ODY2MH0.sROlJf6pLCugcRUrjT66wErX8KQp8dcLrEkDj-QT_PA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
