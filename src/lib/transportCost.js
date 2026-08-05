const ZONE_RATES = {
  'Techiman': 45,
  'Bono West': 55,
  'Ashanti': 70,
  'Northern': 90,
  'Eastern': 80,
  'Volta': 95,
  'Greater Accra': 100,
}

export function getTransportCost(location) {
  return ZONE_RATES[location] || 60
}