const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY deben estar definidos en .env para usar Storage')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

module.exports = supabase
