.
├── AGENTS.md
├── app
│ ├── api
│ │ ├── sync-user
│ │ │ └── route.ts
│ │ └── tour
│ │ └── route.ts
│ ├── auth-test
│ │ └── page.tsx
│ ├── bookmarks
│ │ └── page.tsx
│ ├── error.tsx
│ ├── favicon.ico
│ ├── global-error.tsx
│ ├── globals.css
│ ├── layout.tsx
│ ├── not-found.tsx
│ ├── page.tsx
│ ├── places
│ │ └── [contentId]
│ │ └── page.tsx
│ ├── robots.ts
│ ├── sitemap.ts
│ ├── storage-test
│ │ └── page.tsx
│ └── test-error
│ └── page.tsx
├── components
│ ├── bookmarks
│ │ ├── bookmark-button.tsx
│ │ └── bookmark-list.tsx
│ ├── error-boundary.tsx
│ ├── error-message.tsx
│ ├── error-message-with-retry.tsx
│ ├── navbar.tsx
│ ├── providers
│ │ └── sync-user-provider.tsx
│ ├── tour-card.tsx
│ ├── tour-detail
│ │ ├── detail-gallery.tsx
│ │ ├── detail-info.tsx
│ │ ├── detail-intro.tsx
│ │ └── share-button.tsx
│ ├── tour-filters.tsx
│ ├── tour-list.tsx
│ ├── tour-list-wrapper.tsx
│ ├── tour-pagination.tsx
│ ├── tour-search.tsx
│ ├── tour-sort.tsx
│ ├── ui
│ │ ├── accordion.tsx
│ │ ├── background-image.tsx
│ │ ├── button.tsx
│ │ ├── checkbox.tsx
│ │ ├── dialog.tsx
│ │ ├── form.tsx
│ │ ├── input.tsx
│ │ ├── label.tsx
│ │ ├── loading-spinner.tsx
│ │ ├── select.tsx
│ │ ├── skeleton.tsx
│ │ ├── sonner.tsx
│ │ └── textarea.tsx
├── components.json
├── docs
│ ├── component-verification-report.md
│ ├── design
│ │ └── DESIGN.md
│ ├── DIR.md
│ ├── env-setup.md
│ ├── ERROR-REPORT
│ ├── guide.md
│ ├── guide-compliance-plan.md
│ ├── performance-optimization-guide.md
│ ├── plan-phase5-optimization.md
│ ├── plan-search-feature.md
│ ├── PRD.md
│ ├── reference
│ │ └── mermaid.md
│ ├── seo-test-guide.md
│ ├── supabase-migration-guide.md
│ ├── supabase-migration-status.md
│ ├── TODO.md
│ ├── TROUBLESHOOTING.md
│ ├── vercel-401-error-fix.md
│ ├── vercel-clerk-env-fix.md
│ ├── vercel-env-build-time-fix.md
│ ├── vercel-env-not-injected-fix.md
│ └── vercel-env-setup.md
├── eslint.config.mjs
├── hooks
│ ├── use-bookmark.ts
│ └── use-sync-user.ts
├── lib
│ ├── api
│ │ ├── bookmark-api-client.ts
│ │ └── tour-api-client.ts
│ ├── supabase
│ │ ├── clerk-client.ts
│ │ ├── client.ts
│ │ ├── server.ts
│ │ └── service-role.ts
│ ├── supabase.ts
│ ├── types
│ │ ├── bookmark.ts
│ │ └── tour.ts
│ ├── utils
│ │ └── url-params.ts
│ └── utils.ts
├── middleware.ts
├── next-env.d.ts
├── next.config.ts
├── package.json
├── pnpm-lock.yaml
├── postcss.config.mjs
├── public
│ ├── icons
│ │ ├── icon-192x192.png
│ │ ├── icon-256x256.png
│ │ ├── icon-384x384.png
│ │ └── icon-512x512.png
│ ├── logo.png
│ └── og-image.png
├── README.md
├── scripts
│ ├── verify-env.ts
│ └── verify-guidelines.ts
├── supabase
│ ├── config.toml
│ └── migrations
│ ├── mytrip_schema.sql
│ ├── setup_schema.sql
│ └── setup_storage.sql
└── tsconfig.json
