import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

const AHNLICH_AI_HOST = '127.0.0.1'
const AHNLICH_AI_PORT = 1370
const STORE_NAME = 'agrimatch_listings'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { query } = req.body || {}
  if (!query) return res.status(400).json({ error: 'No query provided' })

  try {
    // Ask ahnlich-ai to find similar listings
    const ahnlichRes = await fetch(
      `http://${AHNLICH_AI_HOST}:${AHNLICH_AI_PORT}/search`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_name: STORE_NAME,
          query,
          closest_n: 10,
        }),
      }
    )

    const ahnlichData = await ahnlichRes.json()
    const ids = (ahnlichData.results || []).map((r) => r.id)

    if (ids.length === 0) return res.status(200).json({ listings: [] })

    // Fetch full listing details from Supabase
    const { data: listings, error } = await supabase
      .from('listings')
      .select('*, users(name, region, rating)')
      .in('id', ids)
      .gt('quantity', 0)

    if (error) throw error

    res.status(200).json({ listings: listings || [] })
  } catch (err) {
    console.error('Ahnlich search error:', err)
    res.status(500).json({ error: err.message })
  }
}