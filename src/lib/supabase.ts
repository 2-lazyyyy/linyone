import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jhwfjntomkgfjnnefhxf.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impod2ZqbnRvbWtnZmpubmVmaHhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMDc5OTQsImV4cCI6MjA4ODg4Mzk5NH0.Y_l8FfAq7m_RGNL03gxdvocJOYVFTLhMWxopvVhAmJs'

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side Supabase client (for API routes and server components)
export function createServerClient() {
  return createClient(supabaseUrl, supabaseAnonKey)
}

