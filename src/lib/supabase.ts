import { createClient } from '@supabase/supabase-js';

// Load from environment variables, fallback to the public connection values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hsljacdnuwuettuacyea.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzbGphY2RudXd1ZXR0dWFjeWVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MjMxMTcsImV4cCI6MjA5NjM5OTExN30.JPPDf0ceAFP-tt1qWEjFQ3BGiMhfIa6XAcfXe0bn1no';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
