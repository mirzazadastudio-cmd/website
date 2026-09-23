# Mirzazada Studio

Public portfolio hosted on GitHub Pages, with Supabase Auth, PostgreSQL, Storage and an Edge Function for the CMS.

- Website: https://mirzazadastudio.com
- Admin: https://mirzazadastudio.com/admin/
- Repository: https://github.com/mirzazadastudio-cmd/website
- Supabase project: wjynujdjmtgpzzllnwgf

## Development and deployment

Use Node 22 and pnpm 11.19.0. Run `pnpm install --frozen-lockfile`, `pnpm run dev`, `pnpm run typecheck`, `pnpm run build`, and `pnpm test`.

A push to main or a manual run of the Deploy Mirzazada Studio workflow publishes the static website. Each build reads current published content from Supabase and generates HTML for the portfolio routes, metadata and sitemap. Existing pages load live content from Supabase in the browser. New slugs work through the GitHub Pages 404 fallback, but need a fresh deployment for an HTTP 200 static page and updated search-engine metadata. After publishing/unpublishing projects or changing slugs, rerun the GitHub workflow to refresh static snapshots. Previously public snapshots remain until this deployment completes.

## Owner access

Use the owner's Supabase email/password. Account creation uses a one-time random setup token whose hash is stored privately; the initial owner is configured during deployment. Passwords, setup tokens and service keys are never included in this repository. Use the Account and password tab to change the initial password.

Only a verified Supabase Auth user matching the private studio_owner UUID can edit. Public callers cannot read private tables or execute write RPCs. Concurrent saves use a row lock and revision check, retaining 30 backups. Original uploads are private; only generated WebP variants are public. Signed original-download links expire after 60 seconds. Contact requests are validated, rate limited, and stored in the admin inbox. Email notifications are not configured.

The frontend Supabase key is intentionally publishable. The service-role key is read only inside the Edge Function runtime. Its platform JWT check is disabled because public read/contact routes use API-key authentication; each private route independently validates a live user and owner UUID.

## Backend source

`supabase/schema.sql` records the initial schema. `supabase/functions/studio-api/index.ts` is the deployed API. Run `node scripts/edge-package.mjs` after shared validation changes, then redeploy the function with its shared directory. Original Cloudflare routes remain for reference; Vite does not bundle or deploy them.

[Leaked-password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection) is disabled in the existing Auth configuration; enable it if supported by the plan.

## Domain.com DNS

Set four A records at @: 185.199.108.153, 185.199.109.153, 185.199.110.153 and 185.199.111.153. Set www CNAME to mirzazadastudio-cmd.github.io. Preserve mail/MX records. GitHub Pages is configured with mirzazadastudio.com. Enable Enforce HTTPS when GitHub finishes issuing the certificate.

[GitHub domain instructions](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).

## Google Search Console

See [Google verification and indexing](GOOGLE-SEARCH-CONSOLE.md) for account verification, sitemap submission, and the relevant Google links. The account-specific verification tag is still required.

### Animation, AI and navigation

`/animation/` shows four silent, five-second films. They play on request, loop, and pause off screen. Encoded MP4s and posters live in `public/animations/`; clip titles are in `lib/animation-clips.ts`. Source selections from the portfolio Animation folder: Marina Village (18�23 s), Rayer�s Showroom (8�13 s), Patio (3�8 s), and Day to Night (5�10 s). Source files are unchanged.

AI is a separate project category and collection at `/collections/ai/`. Assign only AI-created projects to it in the admin panel. Homepage AI note blocks use published journal entries whose topic is exactly `AI`; these are editable in the existing journal editor. The initial three notes and collection are recorded in `content/studio-additions.json`. No existing projects were relabeled as AI.

The navigation hides on downward scrolling and returns on upward scrolling; focused keyboard navigation and an open mobile menu remain visible. The project reel supports momentum after pointer/touch drag and honors reduced motion.

`/refresh/` refreshes a stale homepage cache and returns to the clean root URL. Temporary seven-character revision parameters are removed without removing campaign parameters or anchors.

Validation: `pnpm run typecheck`, `pnpm run build`, `pnpm test`, `pnpm run test:content`.

The homepage opens with a full-width video banner (about 40–42% of the viewport height). Its silent 20-second studio-loop-hd.mp4 combines the four five-second films with 0.7-second crossfades, including the last-to-first transition. It starts automatically in view, pauses off screen/in background tabs, and uses a static poster by default with reduced motion. The four individual films remain on /animation/.

Animation export: 1920x1080, H.264, directly from original source videos (individual films: CRF 18; banner: CRF 19 with an 8 Mbps ceiling). Sequence: Showroom -> Patio -> Sea Breeze / Marina Village -> Day into night.


## Editable Animation playlist
Admin → Animation manages the homepage and /animation/ films: upload or replace MP4/WebM (up to 50 MB each, 1–3600 seconds), edit labels, remove, and reorder with pointer/touch handles or arrow buttons. Duration is read from the file. Save with the existing revision-protected content action. An absent playlist falls back to the four existing clips; an explicit empty playlist hides the banner. The two-layer player overlaps each ending and beginning by 0.5 seconds, including last-to-first, with in-panel preview.

Release after owner approval only: apply supabase/video-storage.sql, run node scripts/edge-package.mjs and deploy studio-api with its shared modules (existing verify_jwt=false; owner verified inside). Then publish the frontend through GitHub. Upload grants are owner-only; no public storage write policy is added. Uploaded video files are public portfolio assets and retained when removed from the list. Avoid publishing the frontend before its backend is ready.

The homepage video playlist sits directly below the project reel and above the discipline strip. The desktop/mobile Animations navigation points to /#animations, including when opened from other pages.
