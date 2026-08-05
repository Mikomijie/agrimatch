import { supabase } from './supabaseClient'

export async function cancelOrder(order) {
  const { error: orderError } = await supabase
    .from('orders')
    .update({ status: 'cancelled' })
    .eq('id', order.id)

  if (orderError) return { error: orderError.message }

  const { data: listing } = await supabase
    .from('listings')
    .select('quantity')
    .eq('id', order.listing_id)
    .single()

  if (listing) {
    await supabase
      .from('listings')
      .update({ quantity: listing.quantity + order.quantity })
      .eq('id', order.listing_id)
  }

  return { error: null }
}