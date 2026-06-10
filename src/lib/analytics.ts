import { logEvent } from 'firebase/analytics'
import { analytics } from './firebase'
import type { ViewType } from './types'

interface PageViewParams    { view: ViewType; page_path: string }
interface ItemViewParams    { item_id: string; view: ViewType; category: string }
interface EnquiryParams     { view: ViewType; category: string }
interface AgeGateParams     { view: 'cannabis' | 'fireworks' | 'tobacco'; result: 'pass' | 'fail' }
interface PawnSubmitParams  { view: 'pawn' }

function fire(event: string, params: object): void {
  if (!analytics) return
  try {
    logEvent(analytics, event, params as Record<string, unknown>)
  } catch { /* analytics failure is non-fatal */ }
}

export const Analytics = {
  pageView(p: PageViewParams):   void { fire('page_view',       p) },
  itemView(p: ItemViewParams):   void { fire('item_view',       p) },
  enquirySubmit(p: EnquiryParams): void { fire('enquiry_submit',  p) },
  ageGateEvent(p: AgeGateParams):  void { fire('age_gate_event',  p) },
  pawnFormSubmit(p: PawnSubmitParams): void { fire('pawn_form_submit', p) },
}
