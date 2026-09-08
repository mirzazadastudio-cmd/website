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
