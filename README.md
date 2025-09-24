# Clothing Store — Next.js app

This repository was created with `create-next-app` (Next.js 15, App Router, TypeScript, TailwindCSS).

Quick start

```bash
# Install dependencies
npm install

# Run dev server (default 3000; auto-selects another port if 3000 is busy)
npm run dev

# Build for production
npm run build

# Start production server after build
npm start
```

Notes

- Source files are under `app/` (App Router). Edit `app/page.tsx` to change the home page.
- TailwindCSS and ESLint are included.
- If port 3000 is already in use, Next will pick the next available port (e.g. 3001, 3002).

Useful links

- Next.js docs: https://nextjs.org/docs
- App Router guide: https://nextjs.org/docs/app

Happy hacking!

Vercel Deploy

To enable automatic deployments to Vercel when pushing to `main`, add the following repository secrets in your GitHub repo settings:

- `VERCEL_TOKEN` — your Vercel personal token (with deploy permissions)
- `VERCEL_ORG_ID` — your Vercel organization ID
- `VERCEL_PROJECT_ID` — your Vercel project ID

Once those are set, pushes to `main` will trigger the `.github/workflows/vercel-deploy.yml` workflow which installs dependencies, builds the app, and deploys to Vercel (production).
