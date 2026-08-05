import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

function PaymentCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [error, setError] = useState(null)

  useEffect(() => {
    async function confirmPayment() {
      const status = searchParams.get('status')
      const txRef = searchParams.get('tx_ref')
      const transactionId = searchParams.get('transaction_id')

      if (!txRef || !txRef.startsWith('AGRIMATCH-')) {
        setError('Invalid payment reference.')
        return
      }

      const orderId = txRef.replace('AGRIMATCH-', '')

      if (status === 'successful' || status === 'completed') {
        const { data: orderData, error: fetchError } = await supabase
          .from('orders')
          .select('listing_id, quantity')
          .eq('id', orderId)
          .single()

        const { error: updateError } = await supabase
          .from('orders')
          .update({
            payment_status: 'paid',
            transaction_id: transactionId,
            payment_date: new Date().toISOString(),
            status: 'confirmed',
          })
          .eq('id', orderId)

        if (updateError) {
          setError(updateError.message)
          return
        }

        if (!fetchError && orderData) {
          const { data: listingData } = await supabase
            .from('listings')
            .select('quantity')
            .eq('id', orderData.listing_id)
            .single()

          if (listingData) {
            await supabase
              .from('listings')
              .update({ quantity: Math.max(0, listingData.quantity - orderData.quantity) })
              .eq('id', orderData.listing_id)
          }
        }

        navigate(`/tracking/${orderId}`)
      } else {
        const { error: updateError } = await supabase
          .from('orders')
          .update({ payment_status: 'failed' })
          .eq('id', orderId)

        if (updateError) {
          console.error(updateError.message)
        }

        setError('Payment was not completed.')
      }
    }

    confirmPayment()
  }, [searchParams, navigate])

  return (
    <div className="min-h-screen bg-[var(--color-background-warm)] flex items-center justify-center px-6">
      <div className="text-center">
        {error ? (
          <>
            <p className="font-[var(--font-heading)] text-2xl text-[var(--color-charcoal)] mb-3">Payment Issue</p>
            <p className="text-[var(--color-charcoal)]/70 mb-6">{error}</p>
            <Link to="/marketplace" className="text-[var(--color-primary)] underline font-semibold">
              Back to Marketplace
            </Link>
          </>
        ) : (
          <p className="text-[var(--color-charcoal)]/70">Confirming your payment...</p>
        )}
      </div>
    </div>
  )
}

export default PaymentCallback