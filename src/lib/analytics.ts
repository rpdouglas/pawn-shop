import { logEvent } from 'firebase/analytics';
import { analytics } from './firebase';
import type { ViewType } from './types';

// PII exclusion is enforced structurally: none of these parameter types
// permit uid, email, name, phone, or any other personal identifier.
// Item IDs are pseudonymous Firestore document IDs — not PII.

interface PageViewParams    { view: ViewType; page_path: string }
interface ItemViewParams    { item_id: string; view: ViewType; category: string }
interface EnquiryParams     { view: ViewType; category: string }
interface AgeGateParams     { view: 'cannabis' | 'fireworks'; result: 'pass' | 'fail' }
interface PawnSubmitParams  { view: 'pawn' }

export const Analytics = {
  pageView(p: PageViewParams): void {
    if (!analytics) return;
    logEvent(analytics, 'page_view', p);
  },
  itemView(p: ItemViewParams): void {
    if (!analytics) return;
    logEvent(analytics, 'item_view', p);
  },
  enquirySubmit(p: EnquiryParams): void {
    if (!analytics) return;
    logEvent(analytics, 'enquiry_submit', p);
  },
  ageGateEvent(p: AgeGateParams): void {
    if (!analytics) return;
    logEvent(analytics, 'age_gate_event', p);
  },
  pawnFormSubmit(p: PawnSubmitParams): void {
    if (!analytics) return;
    logEvent(analytics, 'pawn_form_submit', p);
  },
};
