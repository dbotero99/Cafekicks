# CafeKicks Website

Sneaker & reseller storefront powered by Supabase + Vercel.

## Files
- `index.html` — public storefront customers visit
- `admin.html` — your private dashboard (add items, track inventory)
- `style.css` — shared styles
- `admin.css` — admin-only styles
- `admin.js` — admin logic (add/edit/delete items, AI descriptions)
- `supabase.js` — database connection
- `vercel.json` — hosting config

## Deploy to Vercel (Step by Step)

1. Go to https://github.com and create a new repository called `cafekicks`
2. Upload all these files to that repo
3. Go to https://vercel.com → New Project → Import your `cafekicks` GitHub repo
4. Click Deploy — done! You'll get a URL like `cafekicks.vercel.app`

## Connect Your Domain
1. Buy your domain (e.g. cafekicks.com) on Namecheap
2. In Vercel → your project → Settings → Domains → Add Domain
3. Follow Vercel's DNS instructions (add CNAME record in Namecheap)
4. Done — live in ~10 minutes

## Database
Connected to Supabase project: uicjqycjhxcpjbcjoedx
Table: inventory

## Usage
- Visit `/admin` to add items, manage inventory, generate AI descriptions
- Visit `/` for the public storefront your customers see
