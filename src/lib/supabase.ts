import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Message = {
  id: string;
  slug: string;
  sender_name: string;
  receiver_name: string;
  message: string;
  sender_province: string;
  receiver_province: string;
  theme: string;
  heart_color: string;
  hearts_count: number;
  created_at: string;
};
