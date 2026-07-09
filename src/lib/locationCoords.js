// Approximate coordinates for known demo towns
export const TOWN_COORDS = {
  'Techiman Hub': { lat: 7.5833, lng: -1.9333 },
  'Techiman Central': { lat: 7.5900, lng: -1.9400 },
  'Tuobodom': { lat: 7.6667, lng: -1.9667 },
  'Kintampo South': { lat: 8.0563, lng: -1.7297 },
  'Nkoranza': { lat: 7.5667, lng: -1.7333 },
  'Kumasi': { lat: 6.6885, lng: -1.6244 },
}

// Fallback: if location text doesn't match exactly, try partial match, else default to Techiman
export function getCoordsForLocation(locationText) {
  if (!locationText) return TOWN_COORDS['Techiman Hub']

  const exact = TOWN_COORDS[locationText]
  if (exact) return exact

  const partial = Object.keys(TOWN_COORDS).find((town) =>
    locationText.toLowerCase().includes(town.toLowerCase().split(' ')[0])
  )
  if (partial) return TOWN_COORDS[partial]

  return TOWN_COORDS['Techiman Hub'] // default fallback
}