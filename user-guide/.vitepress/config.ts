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
        text: 'Getting Started',
        items: [
          { text: 'Welcome', link: '/' }
        ]
      },
      {
        text: 'Inventory System',
        items: [
          { text: 'Overview', link: '/inventory/' },
          { text: 'Item Lifecycle', link: '/inventory/lifecycle' },
          { text: 'Intake Process', link: '/inventory/intake' }
        ]
      }
    ]
  }
})
