import { supabase } from './supabaseClient'
import { isListingExpired } from './listingHelpers'

export async function findFulfillment(cropType, quantityNeeded, deadline) {
  const { data: listings, error } = await supabase
    .from('listings')
    .select('*, users(name, phone)')
    .eq('crop_type', cropType)
    .order('created_at', { ascending: true })

  if (error) return { error: error.message, fulfillment: [], totalAllocated: 0 }

  const eligible = listings.filter((listing) => {
    if (listing.quantity <= 0) return false
    if (isListingExpired(listing)) return false

    if (listing.expected_harvest_date) {
      return new Date(listing.expected_harvest_date) <= new Date(deadline)
    }

    return true
  })

  const fulfillment = []
  let remaining = quantityNeeded

  for (const listing of eligible) {
    if (remaining <= 0) break

    const allocate = Math.min(listing.quantity, remaining)
    fulfillment.push({
      listing,
      quantityAllocated: allocate,
    })
    remaining -= allocate
  }

  const totalAllocated = quantityNeeded - remaining

  return {
    error: null,
    fulfillment,
    totalAllocated,
    fullyFulfilled: remaining <= 0,
    shortfall: remaining,
  }
}

export async function createPooledOrder(buyerId, cropType, quantityNeeded, deadline, fulfillment) {
  const { data: demandRequest, error: demandError } = await supabase
    .from('demand_requests')
    .insert({
      buyer_id: buyerId,
      crop_type: cropType,
      quantity_needed: quantityNeeded,
      deadline: deadline,
      status: 'fulfilled',
    })
    .select()
    .single()

  if (demandError) return { error: demandError.message }

  const createdOrders = []

  for (const item of fulfillment) {
    const totalPrice = item.quantityAllocated * item.listing.price_per_unit

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        listing_id: item.listing.id,
        buyer_id: buyerId,
        quantity: item.quantityAllocated,
        total_price: totalPrice,
        status: 'pending',
        payment_status: 'pending',
      })
      .select()
      .single()

    if (orderError) continue

    await supabase.from('demand_fulfillments').insert({
      demand_request_id: demandRequest.id,
      listing_id: item.listing.id,
      farmer_id: item.listing.farmer_id,
      quantity_allocated: item.quantityAllocated,
      order_id: order.id,
    })

    await supabase
      .from('listings')
      .update({ quantity: item.listing.quantity - item.quantityAllocated })
      .eq('id', item.listing.id)

    createdOrders.push(order)
  }

  return { error: null, demandRequest, orders: createdOrders }
}