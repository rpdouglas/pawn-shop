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
      }
    ]
  }
})
