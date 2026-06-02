import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "User Guide",
  description: "Customer-facing documentation",
  base: '/pawn-shop/',
  ignoreDeadLinks: [
    '/contact',
    '/accessibility',
    '/privacy',
    '/terms'
  ],
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' }
    ],
    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Platform Overview', link: '/getting-started' }
        ]
      },
      {
        text: 'Core Inventory',
        items: [
          { text: 'Overview', link: '/inventory/' },
          { text: 'Item Lifecycle', link: '/inventory/lifecycle' },
          { text: 'Intake Process', link: '/inventory/intake' },
          { text: 'Mobile Intake', link: '/inventory/mobile-intake' },
          { text: 'Stock Management', link: '/admin/stock-management' }
        ]
      },
      {
        text: 'Storefronts & Compliance',
        items: [
          { text: 'Cannabis Vertical', link: '/cannabis/overview' },
          { text: 'Fireworks Vertical', link: '/fireworks/overview' },
          { text: 'Tobacco Vertical', link: '/tobacco/overview' },
          { text: 'Age Verification', link: '/compliance/age-gates' },
          { text: 'Discovery & Search', link: '/inventory/search' },
          { text: 'Merchandising', link: '/admin/merchandising' },
          { text: 'Seasonal Campaigns', link: '/admin/campaigns' },
          { text: 'Store Hours Config', link: '/admin/store-hours' }
        ]
      },
      {
        text: 'Customer Features',
        items: [
          { text: 'Authentication & MFA', link: '/customer/auth' },
          { text: 'Saved Searches & Favourites', link: '/customer/favourites' },
          { text: 'Frequently Asked Questions', link: '/customer/faq' },
          { text: 'Articles & Editorial', link: '/customer/articles' },
          { text: 'Support & Legal', link: '/customer/legal' }
        ]
      },
      {
        text: 'Staff & Scheduling',
        items: [
          { text: 'Admin Portal Layout', link: '/admin/portal' },
          { text: 'My Schedule', link: '/staff/personal-schedule' },
          { text: 'Shift Coordination', link: '/admin/scheduling' },
          { text: 'Staff Management', link: '/admin/staff-management' }
        ]
      },
      {
        text: 'Pawn Services',
        items: [
          { text: 'Selling to Us', link: '/pawn/selling' },
          { text: 'Alerts & Notifications', link: '/pawn/alerts-notifications' },
          { text: 'Click & Collect Reservations', link: '/admin/reservations' },
          { text: 'Managing the Inbox', link: '/admin/pawn-inbox' },
          { text: 'Disputes & Returns', link: '/admin/disputes-returns' },
          { text: 'Seasonal Pre-Orders', link: '/admin/preorders' }
        ]
      },
      {
        text: 'Intelligence & Operations',
        items: [
          { text: 'Brand Identity', link: '/admin/branding' },
          { text: 'Global Dashboard', link: '/admin/dashboard' },
          { text: 'Inventory Management', link: '/admin/inventory' },
          { text: 'Editorial CMS', link: '/admin/editorial-cms' },
          { text: 'AI Assistant', link: '/admin/ai-assistant' },
          { text: 'FAQ Management', link: '/admin/faq-management' },
          { text: 'Local SEO', link: '/admin/local-seo' },
          { text: 'Audit Logs', link: '/admin/audit-logs' },
          { text: 'Police Holds', link: '/admin/police-holds' },
          { text: 'Serial Blacklist', link: '/admin/serial-blacklist' },
          { text: 'CRM & Retention', link: '/admin/crm' },
          { text: 'eBay Sync', link: '/ebay/cross-posting' }
        ]
      }

    ]
  }
})
