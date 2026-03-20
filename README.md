# Wabi Gemini Clone

Modern Gemini-style AI chat portfolio app built with React + Vite.

## Features

- Responsive Gemini-style UI
- Voice prompt input
- Image upload with preview
- Recent prompts persistence
- Homepage entrance animation

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` in project root:

```env
VITE_GEMINI_API_KEY=your_api_key_here
```

3. Run dev server:

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Netlify Deployment Checklist

1. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
2. Ensure SPA redirect is present in `netlify.toml`:
   - `from = "/*"`
   - `to = "/index.html"`
   - `status = 200`
3. Add Environment Variable in Netlify Site settings:
   - `VITE_GEMINI_API_KEY`
4. Deploy and verify:
   - Home page loads
   - `Ask Gemini` opens chat
   - Browser refresh on chat page does not 404

## Optional Custom Domain Readiness

1. In Netlify: add custom domain.
2. DNS records:
   - Apex/root: A record to Netlify load balancer (or ALIAS/ANAME depending on provider)
   - `www`: CNAME to your Netlify subdomain
3. Enable HTTPS (Netlify SSL).
4. In your DNS provider, keep TTL low during first setup (for faster propagation).
5. Validate both:
   - `https://yourdomain.com`
   - `https://www.yourdomain.com`

## Pre-Deploy Cleanliness Check

1. `npm run build`
2. `npm run format:check`
3. Confirm no missing env vars
4. Verify favicon and profile image load from `public`
