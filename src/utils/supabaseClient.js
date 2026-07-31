import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vodmnmehlfzutzcnorei.supabase.co'
const supabaseKey = 'sb_publishable_fG9maT6bppr0VlTgbPYuQw_LPKlE41G'

export const supabase = createClient(supabaseUrl, supabaseKey)
