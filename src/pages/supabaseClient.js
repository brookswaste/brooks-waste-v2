// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uxihbbladzdfxxcrwooy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4aWhiYmxhZHpkZnh4Y3J3b295Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3OTE4MDYsImV4cCI6MjA2NjM2NzgwNn0.DyaRQszYCgJdk9SSb5IsG1zVVt47hr8zFJQvEyER024'

export const supabase = createClient(supabaseUrl, supabaseKey)
