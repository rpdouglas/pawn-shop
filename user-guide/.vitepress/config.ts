import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "User Guide",
  description: "Customer-facing documentation",
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' }
    ],
    sidebar: [
      {
        text: 'Core Inventory',
        items: [
          { text: 'Overview', link: '/inventory/' },
          { text: 'Item Lifecycle', link: '/inventory/lifecycle' },
          { text: 'Intake Process', link: '/inventory/intake' }
        ]
      },
      {
        text: 'Storefronts & Compliance',
        items: [
          { text: 'Age Verification', link: '/compliance/age-gates' },
          { text: 'Discovery & Search', link: '/inventory/search' }
        ]
      },
      {
        text: 'Pawn Services',
        items: [
          { text: 'Selling to Us', link: '/pawn/selling' },
          { text: 'Managing the Inbox', link: '/admin/pawn-inbox' }
        ]
      },
      {
        text: 'eBay Integration',
        items: [
          { text: 'Cross-Posting & Sync', link: '/ebay/cross-posting' }
        ]
      },
      {
        text: 'Safety & Accountability',
        items: [
          { text: 'Police Holds', link: '/admin/police-holds' },
          { text: 'Audit Logs', link: '/admin/audit-logs' }
        ]
      }
    ]
  }
})
