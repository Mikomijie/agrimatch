export function isListingExpired(listing) {
  if (!listing || listing.freshness === 'Harvesting Tomorrow') return false

  const harvestTime = new Date(listing.created_at)
  if (listing.freshness === 'Harvested Yesterday') {
    harvestTime.setHours(harvestTime.getHours() - 24)
  }
  const deadline = new Date(harvestTime.getTime() + 12 * 60 * 60 * 1000)
  return new Date() > deadline
}