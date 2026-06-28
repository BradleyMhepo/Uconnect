import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// ── Types ─────────────────────────────────────────────────────────────────────

export type DbPack = {
  id: string
  slug: string
  name: string
  category: string
  city: string
  state: string
  region: string
  mode: string
  lead_count: number
  price: number
  available: boolean
  tagline: string
  created_at: string
}

export type DbLead = {
  id: string
  pack_id: string
  name: string
  city: string
  state: string
  address: string
  zip: string
  phone: string
  website: string
  rating: string
  reviews: string
  mobile_score: string
  problem_found: string
  pitch_angle: string
  source: string
}

// ── Queries ───────────────────────────────────────────────────────────────────

export async function fetchPacks(): Promise<DbPack[]> {
  const { data, error } = await supabase
    .from('packs')
    .select('*')
    .eq('available', true)
    .order('category')
    .order('city')
  if (error) throw error
  return data ?? []
}

export async function fetchPackBySlug(slug: string): Promise<DbPack | null> {
  const { data, error } = await supabase
    .from('packs')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) return null
  return data
}

export async function fetchLeads(packId: string, downloadToken: string): Promise<DbLead[]> {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('pack_id', packId)
  if (error) throw error
  return data ?? []
}
