import { useState } from 'react'
import { httpsCallable } from 'firebase/functions'
import { functions } from '../../lib/firebase'
import Button from '../ui/Button'

interface Props {
  itemId: string
  viewTag: string
  ebayListingId?: string
}

const pushToEbayFn = httpsCallable<
  { itemId: string },
  { success: boolean; ebayListingId: string }
>(functions, 'pushToEbay')

export default function EbayPushButton({ itemId, viewTag, ebayListingId: initialListingId }: Props) {
  const [listingId, setListingId] = useState(initialListingId ?? '')
  const [isPushing, setIsPushing] = useState(false)
  const [error, setError] = useState('')

  if (viewTag !== 'pawn') return null

  if (listingId) {
    return (
      <div className="ebay-listing-badge" aria-live="polite">
        <span className="ebay-listing-label">Listed on eBay</span>
        <span className="ebay-listing-id">{listingId}</span>
      </div>
    )
  }

  const handlePush = async () => {
    setError('')
    setIsPushing(true)
    try {
      const result = await pushToEbayFn({ itemId })
      setListingId(result.data.ebayListingId)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'eBay push failed. Check item details and try again.',
      )
    } finally {
      setIsPushing(false)
    }
  }

  return (
    <div className="ebay-push-wrapper">
      <Button
        type="button"
        variant="secondary"
        onClick={handlePush}
        disabled={isPushing}
        aria-busy={isPushing}
      >
        {isPushing ? 'Listing on eBay…' : 'Push to eBay'}
      </Button>
      {error && (
        <p className="ebay-push-error" role="alert">{error}</p>
      )}
    </div>
  )
}
