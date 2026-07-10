const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('SUPABASE_URL y SUPABASE_ANON_KEY deben estar definidos en .env para usar Storage')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

module.exports = supabase
