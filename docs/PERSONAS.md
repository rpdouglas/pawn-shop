# The Pawn Shop — Persona-Based Development Guide

**Version:** 1.0 · **Source:** ThePawnShop-ProjectPlan-v5.docx
**Brand:** Dapper. Debonair. Distinctly Akwesasne.

> Paste `docs/CONTEXT.md` and this file at the start of every AI coding session.
> Every feature must pass the Persona Check before it ships.

---

## §0 How to Use This Document

Personas are not demographic segments. They are the named humans your code will serve or fail. Every Epic, every component, every copy string should be evaluated through at least one of these eight lenses.

**For every new feature or spec:**

1. **Identify the primary persona** — who is this built for first?
2. **Apply their UX Constraints as acceptance criteria** — not guidelines. If the rule says "sub-60-second alert", that is a pass/fail test, not a aspiration.
3. **Run the Makoonsii Trust Test** — does this feel like it was built by the community, for the community? Or does it feel outsourced and generic?
4. **Run the Marie Discretion Test** — does any CRM communication, push notification, or subject line disclose which view (cannabis, fireworks) the customer uses? If yes, redesign before shipping.
5. **Run the Marcus Photography Test** — is every item image this persona will see shot to dark luxury standard? If the first image is poorly lit, Marcus abandons the page. So does the brand.
6. **Run the Kevin Speed Test** — does the inventory alert fire within 60 seconds of a new listing? Kevin's competitive edge is a platform feature.
7. **Check the Kanien'kéha Rule** — does this feature touch any indigenous language content? Community review is mandatory. No AI generation, ever.

**The primary persona rule:** Design decisions are optimised for the primary persona. Secondary personas are tested against the result. Never average across all personas — this produces a mediocre experience for everyone.

---

## §1 Persona Hierarchy

| Role | Persona | Why |
|---|---|---|
| **Primary Brand Anchor** | Marcus | The living embodiment of the Dapper-Debonair identity. If the brand fails Marcus's aesthetic standard, it fails everyone. |
| **Primary Trust Anchor** | Makoonsii | The community's test of cultural authenticity. If Makoonsii doesn't trust it, the Akwesasne roots claim is hollow. |
| **Primary Retention Driver** | Kevin | High-frequency, high-intent. His VIP tier behaviour is the most important retention signal in the system. |
| **Primary Compliance Anchor** | Marie | Her privacy requirements set the minimum acceptable bar for all CRM, cannabis, and age-gate design. |
| **Primary Conversion Driver** | Dale | His eBay comp behaviour means the AI pricing data (E18) must be accurate before the site can compete on the cross-border market. |
| **Primary Discovery Driver** | Sandra | Her impulse behaviour validates the masonry grid and Staff Picks editorial quality. |
| **Primary Seasonal Driver** | Tanya | Her event-driven purchasing validates the entire Seasonal Engine (E14) and Click-and-Collect (E08). |
| **Primary Editorial Driver** | Jordan | Her appetite for brand narrative validates the Editorial CMS (E19) and PWA quality. |

---

## §2 Recovery Journey Arc — Pawn Shop Equivalent

Users do not arrive at The Pawn Shop in a fixed state. They arrive with context:

```
First-time browse    → Sandra / Jordan (Discovery, no intent yet)
Cross-border trip    → Dale (Deal-verified intent, ready to act fast)
Community trust      → Makoonsii (Relationship-based, needs recognition)
Seasonal event       → Tanya (Time-pressured, high-volume, needs confirmation)
Wellness routine     → Marie (Deliberate, research-heavy, privacy-critical)
Collector hunt       → Kevin (Alert-driven, competitive, speed = success)
Lifestyle curation   → Jordan / Marcus (Editorial standard, brand alignment)
```

Platform design must adapt to each context without the user having to explain themselves.

---

## §3 The Personas

---

### Persona 1: Makoonsii — The Reserve Regular

> *"I've been coming here for years. I trust The Pawn Shop because they are part of our community, and they treat the Akwesasne story with respect."*

**Primary View:** Pawn Shop
**Token Set:** `.view-pawn` — Primary: `#C8A14A` (Gold), Body Font: IM Fell English

| Attribute | Profile |
|---|---|
| **Age** | 45–70 |
| **Location** | Akwesasne local — deep community ties |
| **Tech Comfort** | Low to Moderate |
| **Device** | Mobile-first. Portrait mode. May have accessibility needs (larger text). |
| **Shopping Style** | Loyalty-based, not price-driven. Trust precedes transaction. |

#### Background & Motivation

Makoonsii has multi-generational history with local commerce on Cornwall Island. She has watched outside brands come and go, and she evaluates every digital experience through a single question: does this feel like it belongs here? She does not need the lowest price — she needs to feel like the platform was built by people who understand where she comes from. When the Akwesasne identity is handled authentically — when the language is right, when the photography reflects the community's pride — she becomes the most loyal customer in the system.

#### Emotional State Spectrum

| State | Context | Design Response |
|---|---|---|
| **Best case** | Relaxed, browsing familiar categories, recognising community content (E19) | Large clear product photography, familiar editorial tone, community story front-and-centre |
| **Typical case** | Mobile browsing, moderate attention, looking for a specific item type | Large touch targets, plain language, minimal navigation friction |
| **Worst case** | Encounters jargon, cluttered UI, or content that feels generic and disconnected from Akwesasne | She closes the app and does not return. There is no second chance for a trust failure. |

> **Design rule:** Makoonsii does not give second chances to platforms that feel imported.

#### Goals & Needs

- **Cultural resonance:** Feels that The Pawn Shop is genuinely of Akwesasne, not just located there.
- **Reliability:** Knows what she will find, trusts the condition grades and descriptions.
- **Clarity:** Large touch targets, high-contrast text, plain language navigation.
- **Recognition:** Feels like a known and valued customer, not an anonymous user.

#### Frustrations & Pain Points

- **Generic UX:** Digital experiences built for a global audience, not her community.
- **Jargon:** Technical language, retail buzzwords, or copy that sounds like it was written by an algorithm.
- **Broken trust:** Any content that misrepresents or trivialises the Akwesasne identity (especially Kanien'kéha misuse).
- **Complexity:** Multi-step flows, small touch targets, dense information layouts.

#### UX Constraints (Hard Rules)

- *Rule:* Touch targets minimum 48px. Text minimum 16px body, high contrast.
- *Rule:* Navigation maximum 2 levels deep from homepage to product detail.
- *Rule:* No Kanien'kéha copy that has not passed community review — ever. One violation ends Makoonsii's trust permanently.
- *Rule:* Brand voice must be warm and direct, never clinical or algorithmic. Plain English, not retail speak.
- *Rule:* `aiDescription` is a staff draft only. The description Makoonsii reads must be staff-written or staff-reviewed.

#### Key Epic Alignment

| Epic | Role |
|---|---|
| **E19: Brand Narrative** | Primary. The founder story, Warriors of Akwesasne, and Kanien'kéha integration are built for Makoonsii first. |
| **E05: Storefronts** | Pawn homepage must reflect editorial quality and community identity, not a generic product grid. |
| **E15: CRM** | Follow-up communications must feel personal, not automated. Generic "The Pawn Shop Update" language applies. |

#### Success Metrics

- Return visit rate (Makoonsii cohort: local, 45+)
- Pawn enquiry submission rate (trust conversion)
- Article engagement rate (E19 editorial content)

---

### Persona 2: Dale — The Cross-Border Bargain Hunter

> *"I'm looking for a deal. If I can verify the value against eBay sold comps and find it cheaper at The Pawn Shop, I'm heading across the bridge immediately."*

**Primary View:** Pawn Shop
**Token Set:** `.view-pawn` — Primary: `#C8A14A` (Gold)

| Attribute | Profile |
|---|---|
| **Age** | 30–50 |
| **Location** | Cornwall, ON / Massena, NY |
| **Tech Comfort** | Moderate |
| **Device** | Phone and desktop. Uses multiple tabs to cross-reference simultaneously. |
| **Shopping Style** | Comparative and data-driven. Moves fast once the deal is confirmed. |

#### Background & Motivation

Dale is active on Facebook Marketplace, Kijiji, and eBay simultaneously. He is not loyal to any platform — he is loyal to the best verified deal. He will cross the border for the right price on the right item (tools, electronics, collectibles). His decision flow is: find it, verify it against eBay sold comps, confirm the price, act immediately. The Pawn Shop wins with Dale by making the verification step effortless and the pricing credible.

#### Emotional State Spectrum

| State | Context | Design Response |
|---|---|---|
| **Best case** | Found the item in under 30 seconds, price is clearly competitive with eBay comps visible | Immediate CTA, clear condition grade, one-click enquiry or reserve |
| **Typical case** | Browsing category, using filters, comparing 2-3 items | Fast faceted search, clear condition descriptions, visible pricing history |
| **Worst case** | Stale inventory (item listed but sold weeks ago), hidden pricing, or no way to verify condition grade | He leaves immediately and posts in a local Facebook group that the site is unreliable |

> **Design rule:** Dale must be able to confirm a deal's legitimacy in under 60 seconds from search to price-to-condition verification.

#### Goals & Needs

- **Transparent pricing:** CAD price visible without friction. No "enquire for price" on standard items.
- **Verified condition:** Condition grade (new/like-new/good/fair/poor) prominent and clearly defined.
- **Real-time stock:** He must never arrive at the store for an item that is already sold.
- **eBay comp integration:** AI-informed pricing (E18) means his reference data is already baked in.

#### Frustrations & Pain Points

- **Stale inventory:** Items listed long after they've sold.
- **Hidden pricing:** Any friction in getting to a number.
- **Vague condition descriptions:** "Good condition" means nothing without a defined standard.
- **Slow search:** Sub-300ms search response is a baseline expectation, not a premium feature.

#### UX Constraints (Hard Rules)

- *Rule:* Price in CAD displayed on every item card and detail page without click-through.
- *Rule:* Condition grade displayed as a defined scale (new/like-new/good/fair/poor) with a tooltip definition.
- *Rule:* `status: 'sold'` must remove item from public listings immediately — no lag.
- *Rule:* Search results must return within 300ms. Firestore `searchTokens` prefix search must be optimised for this or Algolia must be evaluated (log decision in DECISIONS.md).
- *Rule:* Recently sold strip (E17) shows Dale that inventory moves fast, creating legitimate urgency.

#### Key Epic Alignment

| Epic | Role |
|---|---|
| **E13: Merchandising / Search** | Primary. Fast, faceted search is Dale's entry point. |
| **E18: AI Operations** | Staff-facing pricing suggestions informed by eBay sold comps directly serve Dale's validation workflow. |
| **E17: Social Proof** | Recently sold module validates deal quality and creates urgency — real urgency, not manufactured. |
| **E06: eBay Cross-Posting** | Keeps inventory status synchronised. |

#### Success Metrics

- Search-to-enquiry conversion rate
- Time on site before first item enquiry
- Repeat visit rate (Dale returns when new inventory arrives)

---

### Persona 3: Tanya — The Seasonal Celebrator

> *"Holidays are about making memories. I need a one-stop shop for my event needs, and I need to know my order is ready exactly when I arrive."*

**Primary View:** Fireworks
**Token Set:** `.view-fireworks` — Primary: `#C0392B` (Red), Display Font: Bebas Neue

| Attribute | Profile |
|---|---|
| **Age** | 25–45 |
| **Location** | Local parent or community organiser |
| **Tech Comfort** | High — active on Instagram and WhatsApp |
| **Device** | Phone primary. Expects consumer-app-grade confirmation flows. |
| **Shopping Style** | Event-driven. Buys in volume. Plans ahead. Needs confirmation parity with apps she already trusts. |

#### Background & Motivation

Tanya is responsible for making holidays memorable — Canada Day, Victoria Day, private celebrations. She coordinates via Instagram and WhatsApp. She expects The Pawn Shop's fireworks experience to match the confirmation UX of a modern consumer app. When she clicks "reserve," she expects an SMS within seconds, a clear pickup window, and zero ambiguity about whether her order is ready. She is not a bargain hunter — she is a planner. Stock-outs and unclear pickup windows are her primary failure modes.

#### Emotional State Spectrum

| State | Context | Design Response |
|---|---|---|
| **Best case** | Planning ahead (2+ weeks before event), full inventory available, bundles clearly organised | Showcase full seasonal catalogue, bundle recommendations, easy multi-item add to reservation |
| **Typical case** | 1 week before holiday, some time pressure, checking availability | Countdown timer creates legitimate urgency, clear stock status, fast Click-and-Collect flow |
| **Worst case** | Day before event, stock running low, unclear whether order is confirmed | She needs an SMS confirmation within 60 seconds of reservation. No confirmation = she goes to a competitor. |

> **Design rule:** Tanya's purchase is only complete when she has received an SMS confirmation with a specific pickup window. Anything less is an incomplete transaction.

#### Goals & Needs

- **Bundle discovery:** Clear seasonal bundle organisation — she does not want to build her own order from scratch.
- **Stock transparency:** Knows immediately which items are available, low stock, or sold out.
- **Confirmed pickup window:** Click-and-Collect confirmation with a specific time window, delivered via SMS.
- **Seasonal planning:** Wants to pre-order her annual favourites and have them confirmed early.

#### Frustrations & Pain Points

- **Stock-outs on arrival:** Driving to the store for an item that was unavailable.
- **Unclear pickup windows:** "We'll call you" is not a confirmation.
- **Disorganised seasonal navigation:** A flat product list with no seasonal context or bundle grouping.
- **Slow confirmation:** Any delay between reservation and SMS confirmation breaks her trust.

#### UX Constraints (Hard Rules)

- *Rule:* Countdown timers (E14) must display real end-of-season dates — never manufactured urgency.
- *Rule:* SMS confirmation must fire within 60 seconds of `reservations/{id}` creation.
- *Rule:* Pickup window must be a specific slot (e.g., "June 30, 2:00–4:00 PM"), never "we'll be in touch."
- *Rule:* All CRM comms use generic "The Pawn Shop Update" language. No "fireworks" disclosure in SMS preview or subject line.
- *Rule:* `status: 'sold'` on any fireworks item must remove it from public view immediately.

#### Key Epic Alignment

| Epic | Role |
|---|---|
| **E14: Seasonal Engine** | Primary. Countdown timers, campaign activation, pre-order flow. |
| **E08: Click & Collect** | Primary. Tanya's confirmation experience lives here. |
| **E12: Alerts & Notifications** | SMS confirmation is her primary trust signal. |
| **E15: CRM Journeys** | Seasonal reminders auto-personalised for next year's events. |

#### Success Metrics

- Click-and-collect completion rate
- SMS confirmation delivery time (target: <60 seconds)
- Seasonal repeat purchase rate (same events, next year)
- Bundle conversion rate

---

### Persona 4: Marie — The Wellness Seeker

> *"I value quality and discretion. I want a boutique shopping experience that helps me find what I need for my wellness routine — without the retail noise."*

**Primary View:** Cannabis Wellness
**Token Set:** `.view-cannabis` — Primary: `#7B4FA0` (Purple), Display Font: Cormorant Garamond

| Attribute | Profile |
|---|---|
| **Age** | 30–60 |
| **Location** | Local and regional |
| **Tech Comfort** | Moderate to High |
| **Device** | Phone and tablet. Expects luxury brand aesthetic equivalent to premium wellness brands. |
| **Shopping Style** | Deliberate and research-driven. Not an impulse buyer. Needs to feel confident before committing. |

#### Background & Motivation

Marie values quality, privacy, and a retail experience that does not feel like a dispensary. She wants The Pawn Shop's cannabis view to feel like a luxury wellness brand — curated, calm, and visually consistent with the brands she already trusts. She researches heavily before purchasing. She approaches by Mood Collection, not by SKU. Her primary barrier is trust: she must feel confident that the platform understands discretion at a structural level, not just as a marketing claim.

#### Emotional State Spectrum

| State | Context | Design Response |
|---|---|---|
| **Best case** | Dedicated research session, no time pressure, exploring Mood Collections | Full editorial layout, deep product descriptions, mood collection navigation |
| **Typical case** | Browsing for a specific wellness need, comparing 2-3 products | Clear Mood Collection filters, staff-written descriptions, discreet enquiry option |
| **Worst case** | Encounters aggressive upselling, poor photography, or any indication that her purchase could be disclosed to others | She leaves and does not return. Privacy trust, once broken, cannot be repaired. |

> **Design rule:** Every decision in the cannabis view — CRM, photography, copy, navigation — must pass the question: "Would a privacy-conscious wellness professional feel comfortable here?" If no, redesign.

#### Goals & Needs

- **Curated discovery:** Mood Collections (Relax, Focus, Social, Ceremony) organised for her use-case, not by SKU taxonomy.
- **Editorial quality:** Product descriptions that explain effect profile and wellness application, not just product specs.
- **Absolute discretion:** No category disclosure in any SMS, email subject, or push notification.
- **Privacy by design:** Anonymous enquiry option before creating a persistent profile.
- **Age gate as trust signal:** The 19+ acknowledgment modal signals that The Pawn Shop takes compliance seriously.

#### Frustrations & Pain Points

- **Poor photography:** Low-quality product images immediately signal that the brand does not understand premium.
- **Aggressive upselling:** Any push toward urgency or "limited availability" that feels manufactured.
- **Privacy exposure:** Any CRM communication that could reveal her category usage to a third party.
- **Generic retail UX:** A flat product grid with no curation, no context, no editorial voice.

#### UX Constraints (Hard Rules)

- *Rule:* All CRM communications (email, SMS, push) use "The Pawn Shop Update" language only. No "cannabis," "weed," "flower," or category words in subject lines, SMS previews, or notification copy.
- *Rule:* 19+ age gate is full-screen acknowledgment, session-scoped only, enforced at router level. Not bypassable by direct URL navigation.
- *Rule:* Every age gate pass/fail is written to `auditLogs`. No exceptions.
- *Rule:* Anonymous enquiry via WhatsApp deep link must be available before account creation is required.
- *Rule:* `rare-find` and `limited-edition` tags on cannabis items are staff-set only. No algorithmic scarcity.
- *Rule:* Photography must match Marketing Guideline 1 (dark luxury, macro, minimalist). A poorly lit product image is a compliance failure for Marie's trust.

#### Key Epic Alignment

| Epic | Role |
|---|---|
| **E11: Privacy & Compliance** | Primary. Anonymous enquiry, discretion-first CRM, age gate audit. |
| **E05: Cannabis Storefront** | Mood Collections navigation, dark luxury aesthetic, editorial product pages. |
| **E15: CRM** | Discretion-first automated follow-up. Never discloses category. |
| **E13: Merchandising** | Mood Collection organisation (Relax/Focus/Social/Ceremony). |
| **E19: Editorial CMS** | Kanien'kéha Mood Collection names (community review mandatory). |

#### Success Metrics

- Anonymous enquiry-to-account-creation conversion
- Mood Collection engagement rate (time in collection vs flat browse)
- CRM opt-in rate (CASL `alertOptIn` — indicator of trust)
- Return visit rate (research-to-purchase cycle)

---

### Persona 5: Kevin — The Reseller & Picker

> *"Information velocity is everything. I need to be the first to know when a rare vintage piece hits the floor so I can act before someone else does."*

**Primary View:** Pawn Shop
**Token Set:** `.view-pawn` — Primary: `#C8A14A` (Gold)

| Attribute | Profile |
|---|---|
| **Age** | 25–50 |
| **Location** | Regional (willing to travel for the right item) |
| **Tech Comfort** | Very High — proficient across marketplace apps, mobile notifications, price-tracking tools |
| **Device** | Phone primary. Background notification delivery is his most critical platform feature. |
| **Shopping Style** | High-frequency and decisive. Once confirmed, acts immediately. |

#### Background & Motivation

Kevin is a professional picker or serious side-hustler. He monitors multiple saved searches simultaneously across several platforms. The Pawn Shop wins Kevin by being the fastest — the first to notify him, within 60 seconds of a listing going live. His VIP tier status is not a loyalty programme feature; it is the platform's acknowledgment that his behaviour has high commercial value. Kevin does not browse — he responds to alerts and converts.

#### Emotional State Spectrum

| State | Context | Design Response |
|---|---|---|
| **Best case** | Alert fires within 60 seconds, item exactly matches saved search, condition grade is accurate | One-tap enquiry or reserve from notification — no additional navigation required |
| **Typical case** | Browsing recently-added items manually, cross-referencing eBay comps | Fast search, recently-added filter, clear condition and price |
| **Worst case** | Alert fires 20 minutes late, item already sold, or alert for an item that doesn't match his saved search | Kevin loses trust in the alert system and manually monitors instead — which is exactly what we're trying to replace |

> **Design rule:** Kevin's value to the platform is in proportion to the speed and accuracy of the alert system. A 10-minute alert delay is a failed feature, not a slightly slow feature.

#### Goals & Needs

- **Sub-60-second alerts:** New inventory matching his saved search notified within 60 seconds of `items/{id}` going live.
- **Saved search management:** Multiple concurrent saved searches across categories with granular filter control.
- **VIP tier access:** Priority notification delivery and exclusive previews for high-engagement users (E15).
- **Accurate stock status:** Never notified about an item that is already sold or on police hold.

#### Frustrations & Pain Points

- **Alert latency:** Any delay longer than 60 seconds is a failure.
- **False positives:** Alerts for items that don't match his criteria, or items already sold.
- **Manual search requirement:** Having to manually check the site because the alert system is unreliable.
- **Slow inventory updates:** `status: 'sold'` lag means he arrives at the store for nothing.

#### UX Constraints (Hard Rules)

- *Rule:* `onItemCreated` Cloud Function must dispatch SMS/email alert within 60 seconds of `status: 'active'` for any item matching a `savedSearches/{id}` where `active: true` and `alertOptIn: true`.
- *Rule:* Saved search alerts must only fire when `status == 'active'` and `policeHold != true`. No alerts for held items.
- *Rule:* CRM sessions tracking 8+ electronics views must proactively prompt Kevin to save a search (E15 CRM Intelligence).
- *Rule:* VIP tier flag is staff-set only. It is triggered by engagement scoring, confirmed by staff, not auto-assigned.
- *Rule:* CASL: `alertOptIn == true` must be verified before every send. No exceptions.

#### Key Epic Alignment

| Epic | Role |
|---|---|
| **E12: Alerts & Notifications** | Primary. 60-second alert delivery is Kevin's defining platform feature. |
| **E15: CRM Intelligence** | VIP tier, engagement scoring, priority access to new arrivals. |
| **E04: Inventory** | `searchTokens[]` accuracy directly impacts alert matching quality. |
| **E13: Merchandising** | `just-arrived` tag and trending score feed his browse sessions when not in alert-response mode. |

#### Success Metrics

- Alert delivery latency (target: <60 seconds — this is a hard SLA)
- Saved search-to-purchase conversion rate
- VIP tier engagement rate
- Session frequency (Kevin returning multiple times daily is the retention signal)

---

### Persona 6: Sandra — The Curious Passerby

> *"I love the thrill of the hunt. I'm looking for that unexpected treasure I didn't even know I wanted until I saw it."*

**Primary View:** Pawn Shop
**Token Set:** `.view-pawn` — Primary: `#C8A14A` (Gold)

| Attribute | Profile |
|---|---|
| **Age** | 20–40 |
| **Location** | Tourist or regional traveller passing through |
| **Tech Comfort** | High — expects modern, social-integrated browsing |
| **Device** | Phone primary. Quick-swipe interactions, short attention windows. |
| **Shopping Style** | Impulse-driven. Responds to curation, social proof, and the feeling of shared discovery. |

#### Background & Motivation

Sandra does not arrive knowing what she wants — the platform must create the want. She responds to editorial curation, visual surprise, and the sense that other people are finding things here right now. The masonry grid (E05) is built for Sandra: non-linear, discovery-oriented, visually rich. Staff Picks are the closest thing to a trusted shop owner whispering "you need to see this." Live activity (E17) — what others are viewing — creates a sense of shared discovery that replicates the physical experience of a busy, exciting shop floor.

#### Emotional State Spectrum

| State | Context | Design Response |
|---|---|---|
| **Best case** | Leisurely browsing, no time pressure, genuinely surprised by something unexpected | Let the masonry grid breathe. Staff Picks front and centre. Quick-view on hover so she doesn't lose her place. |
| **Typical case** | Short browsing window, scrolling the homepage, responding to what catches her eye | Strong opening visual, item photography that communicates the object's character immediately |
| **Worst case** | Encounters a flat list view with no curation, generic photography, no personality | She's gone in 10 seconds. The digital equivalent of a boring clearance aisle. |

> **Design rule:** Sandra's first 10 seconds on the Pawn homepage are the product. If the masonry grid doesn't create a sense of "I could find something here," the rest of the platform does not matter to her.

#### Goals & Needs

- **Visual surprise:** Non-linear discovery layout that rewards scrolling.
- **Social validation:** Knowing others are finding things here, right now.
- **Zero friction browsing:** Quick-view modals so she can inspect without losing her discovery flow.
- **Staff personality:** Staff Picks framed as genuine editorial endorsements, not algorithmic suggestions.

#### Frustrations & Pain Points

- **Linear layouts:** Flat, paginated product lists with no editorial curation.
- **Generic photography:** Product shots that could belong to any retailer.
- **High navigation friction:** Having to leave the browse flow to view a single item.
- **Empty activity:** A site that feels like nobody is using it.

#### UX Constraints (Hard Rules)

- *Rule:* Pawn homepage must use masonry grid (E05.1), not a standard grid. Non-linear layout is a product requirement, not an aesthetic choice.
- *Rule:* Quick-view modal (E13) must be pre-fetched on hover, opening within 200ms of tap/click.
- *Rule:* Staff Picks are editorial endorsements. Copy must be written in the brand voice — first-person curator perspective, not algorithm-generated bullets.
- *Rule:* Live activity feed (E17) is privacy-safe. City-level only. Rate-limited. No PII. No manufactured activity.
- *Rule:* `aiDescription` is never surfaced to Sandra. Only staff-promoted `description` is customer-visible.

#### Key Epic Alignment

| Epic | Role |
|---|---|
| **E05: Pawn Storefront** | Primary. Masonry grid, discovery-first homepage layout. |
| **E13: Merchandising** | Staff Picks, Quick-View modals, trending score. |
| **E17: Conversion** | Live activity feed, recently sold strip. |
| **E19: Editorial** | Finds of the Week is the editorial hook that brings Sandra back. |

#### Success Metrics

- Homepage scroll depth
- Quick-view engagement rate
- First-visit-to-enquiry conversion (impulse signal)
- Return visit rate (discovery loop — "what's new this week?")

---

### Persona 7: Jordan — The Lifestyle Connoisseur

> *"I want an authentic brand experience. I'm looking for the 'best of' — whether it's a vintage watch or a luxury wellness item — curated by experts."*

**Primary View:** All Views
**Token Set:** All three — adapts by view

| Attribute | Profile |
|---|---|
| **Age** | 25–35 |
| **Location** | Regional, digitally mobile |
| **Tech Comfort** | Very High — early PWA adopter, expects app-grade performance |
| **Device** | Phone primary, tablet secondary. Expects native-app performance from a web app. |
| **Shopping Style** | Editorial-focused. Browses for inspiration as much as intent. Responds to buying guides and brand storytelling. |

#### Background & Motivation

Jordan is the persona the brand voice was built for. He or she moves fluidly across all three views — discovering a vintage piece in Pawn, exploring a premium vape in Cannabis, finding a signature bundle in Fireworks — and the brand's coherence across views is itself a discovery experience. Jordan responds to Finds of the Week (E19), buying guides, and the Warriors of Akwesasne brand narrative. AI-enriched descriptions (E18) ensure that even high-volume inventory carries the editorial depth Jordan expects.

#### Emotional State Spectrum

| State | Context | Design Response |
|---|---|---|
| **Best case** | Full browsing session, exploring all three views, reading editorial content | Seamless cross-view navigation, editorial homepage sections, deep product descriptions |
| **Typical case** | Mobile scroll, responding to a Finds of the Week push notification | PWA push lands on the right editorial page, fast load, visual quality immediately evident |
| **Worst case** | Encounters visual inconsistency between views, low-quality photography, or AI-generated copy that reads like a machine wrote it | Brand trust collapses. Jordan is the persona most attuned to when a brand is not living up to its own positioning. |

> **Design rule:** Jordan should want to screenshot the product page and share it. If the layout doesn't pass the "I'd share this" test, the editorial quality is not there yet.

#### Goals & Needs

- **Cross-view coherence:** Pawn, Cannabis, and Fireworks feel like one brand in three expressions — not three disconnected shops.
- **Editorial depth:** Product descriptions that tell a story, not just list specifications.
- **PWA quality:** App-grade load times, offline-capable browsing, push notification delivery.
- **Brand narrative:** Warriors of Akwesasne (E19), founder story, and Kanien'kéha integration all resonate. Authenticity is the value proposition.

#### Frustrations & Pain Points

- **Visual inconsistency:** A high-quality cannabis view that is undermined by a poorly designed pawn section.
- **Generic descriptions:** AI-generated copy that reads like a product datasheet, not a curator's recommendation.
- **Fragmented journeys:** Having to mentally context-switch between views because the brand doesn't hold them together.
- **Slow performance:** Any page that loads slowly signals that the platform is not a premium product.

#### UX Constraints (Hard Rules)

- *Rule:* Cross-view navigation must maintain the Dapper-Debonair brand voice throughout. Only the accent colour and typography adapt — never the editorial standard.
- *Rule:* PWA manifest must include per-view icons and theme colours. App-grade push notification delivery required.
- *Rule:* AI-generated descriptions (E18) must be staff-reviewed before Jordan can read them. `aiDescription` is a draft — only `description` is customer-visible.
- *Rule:* Finds of the Week (E19) must be photographed to Marketing Guideline 1 standard before publication.
- *Rule:* Kanien'kéha in collection names or editorial content requires `indigenousLanguageReviewed: true` before any article is published.

#### Key Epic Alignment

| Epic | Role |
|---|---|
| **E18: AI Operations** | Ensures every item description meets Jordan's editorial standard at scale. |
| **E19: Editorial CMS** | Finds of the Week, buying guides, Warriors of Akwesasne — the content Jordan comes back for. |
| **E13: Merchandising** | Vertical video on Cannabis and Fireworks pages. Cross-view related items. |
| **E15: CRM** | Lifestyle CRM journeys — cross-view browsing flag (`crossViewFlag`) enables personalised multi-view follow-up. |

#### Success Metrics

- Cross-view session rate (`crossViewFlag` trigger)
- Editorial content engagement (Finds of the Week read rate)
- PWA install rate
- Long-term return visit rate (Jordan's repeat engagement validates the editorial investment)

---

### Persona 8: Marcus — The Dapper Connoisseur

> *"The best finds aren't accidental — they're the result of knowing where to look and having the eye to recognise quality. The Pawn Shop gets that."*

**Primary View:** All Views — NEW PERSONA
**Token Set:** All three — aesthetic standard applies across all views

| Attribute | Profile |
|---|---|
| **Age** | 28–45 |
| **Location** | Style-conscious professional or creative, regional and beyond |
| **Tech Comfort** | High — strong visual identity is the filter |
| **Device** | Phone and desktop. Will abandon a product page if the first image is poorly lit. |
| **Shopping Style** | Deliberate and research-informed. Capable of impulse purchase when an item genuinely speaks to him. |

#### Background & Motivation

Marcus is the living embodiment of the Dapper-Debonair brand identity. He collects not for resale margin but for beauty, story, and provenance: a vintage Rolex, a mint-condition acoustic guitar, a limited-edition vape in brushed chrome. He frequents auction houses, vintage boutiques, and curated resale platforms. He arrived at The Pawn Shop through a Staff Picks post on Instagram and came expecting to be impressed.

Marcus is not motivated by price — he is motivated by presentation, provenance, and the sense that this brand understands what makes an object exceptional. Every item Marcus encounters — across all three views — must be photographed to the dark luxury standard. This is not an aesthetic preference. It is the entry condition for his engagement.

#### Emotional State Spectrum

| State | Context | Design Response |
|---|---|---|
| **Best case** | Deep exploration session, reading full descriptions, following cross-view narrative connections | Long-form provenance notes visible, photography at maximum quality, editorial framing of scarcity where real |
| **Typical case** | Browsing Finds of the Week, responding to a VIP early-access preview | One item that is genuinely exceptional, described with depth, photographed perfectly |
| **Worst case** | Encounters a poorly lit product image, generic AI-generated copy, or `rare-find` applied to a non-rare item | Exits the page and disengages from the brand. Marcus has seen enough platforms with great positioning and poor execution to be immune to promises. |

> **Design rule:** Every product page Marcus might encounter must pass the Marcus Photography Test before it is published: well-lit, dark luxury standard, macro detail where relevant. One bad image disqualifies the entire page.

#### Goals & Needs

- **Photography standard:** Dark luxury macro photography as baseline — not aspiration.
- **Provenance depth:** `provenanceNotes` field visible on high-value items. The story behind the object is as important as the condition grade.
- **Authentic scarcity signals:** `rare-find` and `limited-edition` applied only when genuinely true. Marcus knows the difference.
- **Cross-view narrative:** A vintage lighter in Pawn, a premium vape in Cannabis, and a "Ceremony" bundle in Fireworks can form a coherent lifestyle narrative. Marcus will appreciate and share it.
- **VIP access:** Priority preview of new arrivals. Marcus's deep engagement and high photography-click rate qualify him for VIP tier (E15).

#### Frustrations & Pain Points

- **Generic listing copy:** Descriptions that describe condition grade only, with no provenance or story.
- **Poor photography:** Any image that does not meet the dark luxury standard. One bad photo ends the session.
- **Manufactured scarcity:** `rare-find` on common items. Marcus recognises false signals immediately, and they destroy brand trust.
- **Visual inconsistency:** Premium presentation in one view undermined by sub-standard presentation in another.

#### UX Constraints (Hard Rules)

- *Rule:* The Marcus Photography Test runs before any item is published: is the primary image shot to dark luxury standard (macro, dark background, well-lit, minimal)? If not, do not publish. Return to staff for re-photography.
- *Rule:* `provenanceNotes` on high-value items must be staff-written. This is not an `aiDescription` use case — provenance carries cultural weight and must reflect real knowledge.
- *Rule:* `rare-find` and `limited-edition` are staff-set only, enforced by Firestore rule. Never algorithmic, never auto-applied.
- *Rule:* VIP tier (E15) enables early access to new arrivals. The notification must arrive before public listing goes live — this requires a deliberate sequencing step in the inventory workflow.
- *Rule:* Cross-view campaign coherence (E14) — if a campaign connects items across views, the visual and editorial treatment must be consistent across all three token sets.

#### Warriors of Akwesasne Alignment

Marcus responds to authentic brand mythology. The founder story, the Warriors of Akwesasne narrative, and the emphasis on Indigenous commerce as cultural pride resonate with his appreciation for objects and businesses that carry meaning. This is a significant brand differentiator: The Pawn Shop is not just a store — it is a point of view. Marcus will share that story if it is told with integrity.

#### Key Epic Alignment

| Epic | Role |
|---|---|
| **E19: Brand Narrative** | Warriors of Akwesasne series, founder story, Finds of the Week — Marcus's primary content. |
| **E18: AI Operations** | AI descriptions must go beyond condition grade into provenance and cultural context. Staff review is mandatory. |
| **E15: CRM / VIP** | VIP tier with lifestyle CRM journeys. Cross-view browsing flag triggers premium editorial follow-up. |
| **E04: Inventory** | `provenanceNotes` and `merchandisingTags` fields are critical for Marcus's engagement. |

#### Success Metrics

- Photography-click rate (primary image engagement — indicator of quality standard)
- `provenanceNotes` read rate (engagement with depth)
- VIP tier activation rate (behaviour-to-tier conversion)
- Cross-view session depth (Marcus's cross-view journey)
- Brand share rate (social sharing of Finds of the Week, Staff Picks)

---

## §4 Anti-Personas

Anti-personas document design failure modes — users who could be harmed by specific features, or whose presence signals that a feature has been built incorrectly.

---

### Anti-Persona A — The Manufactured Scarcity Shopper

A user who responds to artificial urgency — countdown timers on non-scarce items, `rare-find` tags on common inventory, stock warnings on items with full supply.

**Risk:** Building urgency mechanics (E14, E17) without real scarcity data creates a culture of manipulation that alienates Marcus, erodes Kevin's trust in alert accuracy, and violates the brand's core commitment to authenticity.

**Design responses enforced:**
- `rare-find` and `limited-edition` are staff-set only — Firestore rule enforces this at write time
- Countdown timers only display real end-of-season dates from `campaigns/{id}`
- Live activity feed (E17) is rate-limited and city-level only — no manufactured social proof
- Recently sold strip shows real sold items from `onItemSold` Firestore events only

**Rule:** Never manufacture scarcity. Every urgency signal must be verifiable against real inventory data.

---

### Anti-Persona B — The Disclosure Risk

A customer whose cannabis or fireworks purchase history could be disclosed through careless CRM design — email subject lines, SMS previews, or push notification copy that names the category.

**Risk:** A single SMS that reads "Your cannabis order update" or an email subject with "fireworks" in it can expose a customer's purchase to a partner, employer, or family member. For Marie in particular, this is a trust-ending event.

**Design responses enforced:**
- All CRM communications use "The Pawn Shop Update" language universally
- No category-specific language in subject lines, SMS bodies, or push notification copy
- CASL `alertOptIn` checked before every send — opt-in is explicit, not assumed

**Rule:** Run the Marie Discretion Test on every CRM template before it goes live. No exceptions.

---

### Anti-Persona C — The Kanien'kéha Appropriator

A content creator (internal or AI) who generates Kanien'kéha phrases without community review, treating the language as decoration rather than a living cultural expression.

**Risk:** AI-generated or casually inserted Kanien'kéha content that has not passed community review is a violation of the brand's core commitment and could cause real harm to The Pawn Shop's relationship with Akwesasne.

**Design responses enforced:**
- AI must never generate Kanien'kéha — enforced as a compliance rule in CONTEXT.md and all AI session prompts
- `articles/{id}.indigenousLanguageReviewed` must be `true` before any article with Kanien'kéha content is published
- Firestore rule prevents publishing articles without this flag

**Rule:** Kanien'kéha is not content. It is a trust relationship. Treat it accordingly.

---

## §5 Persona Overlap Register

| Pair | Overlap | Resolution |
|---|---|---|
| Dale ↔ Kevin | Both Pawn, both price/value-focused | **Cadence is opposite:** Dale makes infrequent, high-intent cross-border trips. Kevin monitors constantly and moves on the first alert. Same inventory system, completely different UX timing needs. |
| Jordan ↔ Marcus | Both All Views, both editorial-driven | **Trigger is different:** Jordan responds to brand narrative and editorial content (E19). Marcus responds to photography quality and provenance depth (E18 + E04). Same standard, different entry points. |
| Makoonsii ↔ Sandra | Both discovery-mode Pawn users | **Tech context is opposite:** Makoonsii needs low-friction, large-target, plain-language UX. Sandra needs visual richness and editorial personality. The masonry grid must work for both — high visual quality with accessible touch targets. |
| Marie ↔ Jordan | Both deliberate, research-driven | **Privacy weight is different:** Marie's privacy requirement governs every design decision in the cannabis view. Jordan's requirement is editorial quality. For cannabis-view items, both constraints apply simultaneously. |
| Kevin ↔ Marcus | Both high-engagement, VIP-eligible | **Motivation is opposite:** Kevin's VIP value is speed — he needs first alert. Marcus's VIP value is depth — he needs early access with full editorial context. Same VIP tier, different trigger and reward design. |

---

## §6 Persona-to-Epic Strategic Alignment

| Persona | Primary View | Key Epic | Conversion Trigger | Retention Mechanism |
|---|---|---|---|---|
| Makoonsii | Pawn | E19: Brand Narrative | Akwesasne identity / trust | E19: Editorial & community story |
| Dale | Pawn | E13: Search + E18: AI Pricing | eBay comp match + verified condition | E12: Category alerts / new inventory |
| Tanya | Fireworks | E14: Seasonal Engine | E14: Countdown + stock availability | E15: Seasonal CRM journeys |
| Marie | Cannabis | E11: Privacy / Compliance | E11: Anonymous enquiry, discretion | E15: Discretion-first CRM |
| Kevin | Pawn | E12: Alerts + E15: VIP | 60-second alert to rare find | E15: VIP tier / priority access |
| Sandra | Pawn | E05: Masonry + E13: Staff Picks | Impulse from editorial discovery | E17: Live activity / Finds of the Week |
| Jordan | All Views | E18: AI Ops + E19: Editorial | Cross-view editorial quality | E19: Finds of the Week / buying guides |
| Marcus | All Views | E18: AI Ops + E19: Narrative | Photography standard + provenance | E15: Lifestyle CRM / VIP early access |

---

## §7 Compliance Gates by Persona

Every feature must pass its persona's compliance gate before shipping to production.

| Persona | Mandatory compliance check |
|---|---|
| Makoonsii | No Kanien'kéha without `indigenousLanguageReviewed: true` |
| Dale | `status: 'sold'` removes item immediately. No stale listings. |
| Tanya | SMS confirmation within 60 seconds. `auditLogs` entry for every age gate event (fireworks 18+). |
| Marie | 19+ gate enforced at router level, session-scoped, logged to `auditLogs`. All CRM = generic language. |
| Kevin | CASL `alertOptIn: true` verified before every alert send. No alerts for `policeHold: true` items. |
| Sandra | `rare-find` / `limited-edition` staff-set only. Live activity: rate-limited, no PII, city-level only. |
| Jordan | PWA performance: Lighthouse ≥90. `aiDescription` never customer-visible. |
| Marcus | Marcus Photography Test passed before publish. `provenanceNotes` staff-written, not AI-generated. |

---

*The Pawn Shop · docs/PERSONAS.md · v1.0 · Dapper. Debonair. Distinctly Akwesasne.*
