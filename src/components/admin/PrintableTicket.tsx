import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { formatPrice, formatDate } from '../../lib/format'
import type { PrintTicketData } from '../../lib/types'

interface Props {
  data: PrintTicketData | null
}

export default function PrintableTicket({ data }: Props) {
  // Preload both the signature and the logo before opening the print dialog.
  // window.print() can fire before async fetches complete; images inside display:none
  // containers may not be cached yet. Promise.all waits for both, onerror resolves so
  // print always fires even if one asset fails to load.
  useEffect(() => {
    if (!data) return
    const preload = (src: string) => new Promise<void>(resolve => {
      const img = new window.Image()
      img.onload = () => resolve()
      img.onerror = () => resolve()
      img.src = src
    })
    Promise.all([
      preload(data.signatureUrl),
      preload('/branding/logo_pc.png'),
    ]).then(() => window.print())
  }, [data])

  if (!data) return null

  const redemptionCents = Math.round(data.loanAmountCents * (1 + data.interestRate))
  const aprPct = (data.interestRate * (365 / data.periodDays) * 100).toFixed(1)
  const itemMakeModel = [data.itemMake, data.itemModel].filter(Boolean).join(' / ')

  return createPortal(
    <div className="print-ticket">
      <div className="print-ticket-copy-header">Customer Copy — Keep for Redemption</div>

      <div>
        <img src="/branding/logo_pc.png" alt="The Pawn Shop" className="print-ticket-logo" />
        <div className="print-ticket-shop-address">Cornwall Island · Akwesasne</div>
        <div className="print-ticket-divider" />
        <div className="print-ticket-title">Pawn Loan Agreement</div>
        <div className="print-ticket-number">Ticket No: {data.ticketNumber}</div>
        <div className="print-ticket-date">Date: {formatDate(data.issuedAt)}</div>
      </div>

      {/* Pledged Item */}
      <div className="print-ticket-section">
        <span className="print-ticket-label">Pledged Item</span>
        <span className="print-ticket-value">{data.itemDescription}</span>
      </div>

      {/* Structured item details grid — shown only when at least one field is present */}
      {(data.itemCategory || itemMakeModel || data.serialNumber || data.itemColour || data.condition || data.notableMarkings || data.agreedItemValueCents) && (
        <div className="print-ticket-terms-grid">
          {data.itemCategory && (
            <div className="print-ticket-term">
              <span className="print-ticket-label">Category</span>
              <span className="print-ticket-value">{data.itemCategory}</span>
            </div>
          )}
          {itemMakeModel && (
            <div className="print-ticket-term">
              <span className="print-ticket-label">Make / Model</span>
              <span className="print-ticket-value">{itemMakeModel}</span>
            </div>
          )}
          {data.itemColour && (
            <div className="print-ticket-term">
              <span className="print-ticket-label">Colour</span>
              <span className="print-ticket-value">{data.itemColour}</span>
            </div>
          )}
          {data.serialNumber && (
            <div className="print-ticket-term">
              <span className="print-ticket-label">Serial #</span>
              <span className="print-ticket-value">{data.serialNumber}</span>
            </div>
          )}
          {data.condition && (
            <div className="print-ticket-term">
              <span className="print-ticket-label">Condition</span>
              <span className="print-ticket-value" style={{ textTransform: 'capitalize' }}>{data.condition}</span>
            </div>
          )}
          {data.notableMarkings && (
            <div className="print-ticket-term" style={{ gridColumn: '1 / -1' }}>
              <span className="print-ticket-label">Notable Markings</span>
              <span className="print-ticket-value">{data.notableMarkings}</span>
            </div>
          )}
          {data.agreedItemValueCents != null && (
            <div className="print-ticket-term" style={{ gridColumn: '1 / -1' }}>
              <span className="print-ticket-label">Agreed Item Value</span>
              <span className="print-ticket-value">{formatPrice(data.agreedItemValueCents)}</span>
            </div>
          )}
        </div>
      )}

      {/* Loan terms grid */}
      <div className="print-ticket-terms-grid">
        <div className="print-ticket-term">
          <span className="print-ticket-label">Loan Amount</span>
          <span className="print-ticket-value">{formatPrice(data.loanAmountCents)}</span>
        </div>
        <div className="print-ticket-term">
          <span className="print-ticket-label">Interest Rate</span>
          <span className="print-ticket-value">{(data.interestRate * 100).toFixed(2)}% per period</span>
        </div>
        <div className="print-ticket-term">
          <span className="print-ticket-label">Term</span>
          <span className="print-ticket-value">{data.periodDays} days</span>
        </div>
        <div className="print-ticket-term">
          <span className="print-ticket-label">Due Date</span>
          <span className="print-ticket-value">{formatDate(data.dueDate)}</span>
        </div>
        <div className="print-ticket-term" style={{ gridColumn: '1 / -1' }}>
          <span className="print-ticket-label">Redemption Amount</span>
          <span className="print-ticket-value print-ticket-redemption">{formatPrice(redemptionCents)}</span>
        </div>
      </div>

      <div className="print-ticket-apr-notice">
        Annual Percentage Rate (APR): {aprPct}%
      </div>

      {/* Explicit page-break element — break-after on a preceding sibling is more
          reliable than break-before on the target in Blink when the container was
          previously display:none on screen. Both break directions are set. */}
      <div className="print-page-break" aria-hidden="true" />

      {/* Terms & Conditions — page 2 */}
      <div className="print-ticket-agreement">
        <div className="print-ticket-copy-header">— Page 2 of 2 — Terms &amp; Conditions</div>
        <span className="print-ticket-label">Terms &amp; Conditions</span>
        <div className="print-ticket-agreement-text">
          <p>The customer leaves the above item as security for this loan. To reclaim the item, the full redemption amount must be paid by the due date shown above.</p>
          <p>In the event of default, the lender&apos;s only remedy is possession and resale of the pledged item. No further charges, fees, or legal action will be pursued against the customer after forfeiture.</p>
          <p>Extensions may be requested at the discretion of staff before the due date. Contact The Pawn Shop before the due date to discuss extension options.</p>
          <p>The Pawn Shop reserves the right to place a police hold on any item at the request of a law enforcement agency. Items subject to a police hold cannot be redeemed until the hold is lifted; the loan period will be tolled for the duration of any hold.</p>
          <p>Ticket No. {data.ticketNumber} is proof of this agreement and must be presented with valid photo ID for redemption.</p>
        </div>
      </div>

      {/* Signature section */}
      <div className="print-ticket-signature-section">
        <div className="print-ticket-declaration">
          By signing, I confirm that I am 18 years of age or older, that I am the lawful owner of the above item or have authority to pledge it, and that I am not under the influence of alcohol or drugs at the time of this agreement.
        </div>
        <span className="print-ticket-label">Customer Signature</span>
        <img src={data.signatureUrl} alt="Customer signature" className="print-ticket-signature-img" />
        <div className="print-ticket-signer-name">{data.customerName}</div>
      </div>

      <div className="print-ticket-footer">
        {data.staffName && (
          <div className="print-ticket-footer-text">Issued by: {data.staffName}</div>
        )}
        <div className="print-ticket-footer-text">Authorized by The Pawn Shop · Cornwall Island, Akwesasne</div>
        <div className="print-ticket-footer-text">Records retained in accordance with applicable law.</div>
        <div className="print-ticket-footer-text">CUSTOMER COPY — Keep this ticket. Required for redemption with photo ID.</div>
      </div>
    </div>,
    document.body
  )
}
