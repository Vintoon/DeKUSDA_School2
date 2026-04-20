import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL  || 'https://ddqdfilyncsgedphdzok.supabase.co'
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkcWRmaWx5bmNzZ2VkcGhkem9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwOTkwNDAsImV4cCI6MjA5MTY3NTA0MH0.UTTTzjJCLvu--F5Pvaf9owfk8aE0vm3avcP_pdQV2eU'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)

export function getYouTubeId(url) {
  if (!url) return null
  const m = url.match(/(?:v=|\/v\/|youtu\.be\/|\/embed\/)([a-zA-Z0-9_-]{11})/)
  return m ? m[1] : null
}

export function getYouTubeThumbnail(url) {
  const id = getYouTubeId(url)
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null
}
