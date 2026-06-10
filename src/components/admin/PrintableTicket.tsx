import { createPortal } from 'react-dom'
import { formatPrice, formatDate } from '../../lib/format'
import type { PrintTicketData } from '../../lib/types'

interface Props {
  data: PrintTicketData | null
}

export default function PrintableTicket({ data }: Props) {
  if (!data) return null

  const redemptionCents = Math.round(data.loanAmountCents * (1 + data.interestRate))

  return createPortal(
    <div className="print-ticket">
      <div>
        <div className="print-ticket-shop-name">The Pawn Shop</div>
        <div className="print-ticket-shop-address">Cornwall Island · Akwesasne</div>
        <div className="print-ticket-divider" />
        <div className="print-ticket-title">Pawn Loan Agreement</div>
        <div className="print-ticket-number">Ticket No: {data.ticketNumber}</div>
        <div className="print-ticket-date">Date: {formatDate(data.issuedAt)}</div>
      </div>

      <div className="print-ticket-section">
        <span className="print-ticket-label">Item</span>
        <span className="print-ticket-value">{data.itemDescription}</span>
      </div>

      <div className="print-ticket-terms-grid">
        <div className="print-ticket-term">
          <span className="print-ticket-label">Loan Amount</span>
          <span className="print-ticket-value">{formatPrice(data.loanAmountCents)}</span>
        </div>
        <div className="print-ticket-term">
          <span className="print-ticket-label">Interest Rate</span>
          <span className="print-ticket-value">{(data.interestRate * 100).toFixed(1)}%</span>
        </div>
        <div className="print-ticket-term">
          <span className="print-ticket-label">Term</span>
          <span className="print-ticket-value">{data.periodDays} days</span>
        </div>
        <div className="print-ticket-term">
          <span className="print-ticket-label">Due Date</span>
          <span className="print-ticket-value">{formatDate(data.dueDate)}</span>
        </div>
        <div className="print-ticket-term">
          <span className="print-ticket-label">Redemption Amount</span>
          <span className="print-ticket-value print-ticket-redemption">{formatPrice(redemptionCents)}</span>
        </div>
      </div>

      <div className="print-ticket-agreement">
        <span className="print-ticket-label">Terms &amp; Conditions</span>
        <div className="print-ticket-agreement-text">
          <p>The customer leaves the above item as security for this loan. To reclaim the item, the full redemption amount must be paid by the due date shown above.</p>
          <p>Failure to redeem by the due date will result in the item becoming the property of The Pawn Shop for resale. Extensions may be requested at the discretion of staff before the due date.</p>
          <p>Ticket No. {data.ticketNumber} is proof of this agreement and must be presented for redemption.</p>
        </div>
      </div>

      <div className="print-ticket-signature-section">
        <span className="print-ticket-label">Customer Signature</span>
        <img src={data.signatureUrl} alt="Customer signature" className="print-ticket-signature-img" />
        <div className="print-ticket-signer-name">{data.customerName}</div>
      </div>

      <div className="print-ticket-footer">
        <div className="print-ticket-footer-text">Authorized by The Pawn Shop · Cornwall Island, Akwesasne</div>
        <div className="print-ticket-footer-text">Keep this ticket — it is required for redemption.</div>
      </div>
    </div>,
    document.body
  )
}
