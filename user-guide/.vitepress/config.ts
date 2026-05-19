import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "User Guide",
  description: "Customer-facing documentation",
  base: '/pawn-shop/',
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
          { text: 'Discovery & Search', link: '/inventory/search' },
          { text: 'Merchandising', link: '/admin/merchandising' },
          { text: 'Seasonal Campaigns', link: '/admin/campaigns' }
        ]
      },
      {
        text: 'Staff & Scheduling',
        items: [
          { text: 'My Schedule', link: '/staff/personal-schedule' },
          { text: 'Shift Coordination', link: '/admin/scheduling' },
          { text: 'Staff Management', link: '/admin/staff-management' }
        ]
      },
      {
        text: 'Pawn Services',
        items: [
          { text: 'Selling to Us', link: '/pawn/selling' },
          { text: 'Managing the Inbox', link: '/admin/pawn-inbox' },
          { text: 'Disputes & Returns', link: '/admin/disputes-returns' },
          { text: 'Seasonal Pre-Orders', link: '/admin/preorders' }
        ]
      },
      {
        text: 'Intelligence & Operations',
        items: [
          { text: 'Global Dashboard', link: '/admin/dashboard' },
          { text: 'Inventory Management', link: '/admin/inventory' },
          { text: 'AI Assistant', link: '/admin/ai-assistant' },
          { text: 'Audit Logs', link: '/admin/audit-logs' },
          { text: 'Police Holds', link: '/admin/police-holds' },
          { text: 'eBay Sync', link: '/ebay/cross-posting' }
        ]
      }

    ]
  }
})
