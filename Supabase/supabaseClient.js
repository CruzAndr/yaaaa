
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = 'https://yhfggvijycustuucdigh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloZmdndmlqeWN1c3R1dWNkaWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3MDc1ODQsImV4cCI6MjA3ODI4MzU4NH0.T7ri85UbHY2KcHbdNEGz1JY-gk0cjm-P35awwv1JYU8';

const supabaseOptions = {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-react-native',
    },
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, supabaseOptions);
