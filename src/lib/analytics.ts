import { logEvent, setUserProperties as _setUserProperties } from 'firebase/analytics'
import { analytics } from './firebase'
import { getUtm } from './utm'
import type { ViewType } from './types'

// GA4 Ecommerce item shape — no PII; price in CAD dollars (not cents)
export interface GA4Item {
  item_id: string
  item_name: string
  item_category: string
  item_variant: string
  item_list_name: string
  price: number
  currency: 'CAD'
}

// Build a GA4Item from any item-like object. Converts price from CAD cents to CAD dollars.
export function toGA4Item(
  item: { id: string; title: string; category: string; condition: string; price: number },
  listName: string,
): GA4Item {
  return {
    item_id: item.id,
    item_name: item.title,
    item_category: item.category,
    item_variant: item.condition,
    item_list_name: listName,
    price: item.price / 100,
    currency: 'CAD',
  }
}

// ── Parameter interfaces ────────────────────────────────────────────────────

interface PageViewParams      { view: ViewType; page_path: string }
interface ViewItemListParams  { item_list_name: string; view: ViewType; items: GA4Item[] }
interface SelectItemParams    { item_list_name: string; view: ViewType; items: [GA4Item] }
interface ViewItemParams      { view: ViewType; items: [GA4Item] }
interface GenerateLeadParams  { view: ViewType; items?: GA4Item[]; value?: number; currency?: 'CAD' }
interface SearchParams        { search_term: string; view: ViewType }
interface AgeGateParams       { view: 'cannabis' | 'fireworks' | 'tobacco'; result: 'pass' | 'fail' }
interface CampaignParams      { campaign_id: string; campaign_name: string; view: ViewType }
interface WishlistParams      { view: ViewType; items: [GA4Item] }

// ── Core fire helper — merges UTM params into every event ──────────────────

function fire(event: string, params: object): void {
  if (!analytics) return
  try {
    logEvent(analytics, event, {
      ...params,
      ...getUtm(),
    } as Record<string, unknown>)
  } catch { /* analytics failure is non-fatal */ }
}

// ── User properties (no PII — is_staff boolean, preferred_view string) ─────

export function setAnalyticsUserProperties(props: Record<string, string>): void {
  if (!analytics) return
  try {
    _setUserProperties(analytics, props)
  } catch { /* non-fatal */ }
}

// ── Public event API ────────────────────────────────────────────────────────

export const Analytics = {
  // Route-level page view
  pageView(p: PageViewParams):          void { fire('page_view',              p) },

  // GA4 recommended ecommerce funnel
  viewItemList(p: ViewItemListParams):  void { fire('view_item_list',         p) },
  selectItem(p: SelectItemParams):      void { fire('select_item',            p) },
  viewItem(p: ViewItemParams):          void { fire('view_item',              p) },
  generateLead(p: GenerateLeadParams):  void { fire('generate_lead',          p) },

  // Search
  search(p: SearchParams):              void { fire('search',                 p) },

  // Compliance — age gate pass/fail
  ageGateEvent(p: AgeGateParams):       void { fire('age_gate_event',         p) },

  // Campaigns
  campaignView(p: CampaignParams):      void { fire('campaign_view',          p) },
  campaignClick(p: CampaignParams):     void { fire('campaign_click',         p) },

  // Wishlist / favourites
  wishlistAdd(p: WishlistParams):       void { fire('add_to_wishlist',        p) },
  wishlistRemove(p: WishlistParams):    void { fire('remove_from_wishlist',   p) },
}
