# Gold Flower Music Picker

A standalone React/Vite PWA for Gold Flower Media agents to select background music for listing videos.

---

## Setup

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
```

---

## Configuration

### 1. Add Artlist Preview URLs

Open `src/tracks.json` and replace each `"REPLACE_WITH_ARTLIST_PREVIEW_URL"` with the actual preview MP3 URL from Artlist.

```json
{
  "id": 1,
  "title": "Pacific Heights",
  "previewUrl": "https://cdn.artlist.io/preview/abc123.mp3"
}
```

Tracks with placeholder URLs will show a disabled play button — the rest of the app works normally.

### 2. Set Up Formspree

1. Go to [formspree.io](https://formspree.io) → **New Form**
2. Name it "Gold Flower Music Picker" and set your notification email
3. Copy the endpoint URL (e.g. `https://formspree.io/f/xabcdefg`)
4. Open `src/App.jsx` and replace:
   ```js
   const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID'
   ```
   with your actual endpoint.

### 3. Connect Google Sheets (via Formspree)

1. In Formspree, open your form → **Integrations**
2. Click **Google Sheets** → authorize your Google account
3. Select or create a spreadsheet — submissions will appear there automatically

The form submits these fields: `firstName`, `lastName`, `email`, `phone`, `address`, `notes`, `musicSelection`.

---

## Adding / Removing Tracks

Edit `src/tracks.json`. Each track object:

```json
{
  "id": 13,
  "title": "Track Name",
  "artist": "Artist Name",
  "duration": "1:10",
  "bpm": 85,
  "tags": ["warm", "upbeat"],
  "previewUrl": "https://..."
}
```

Available tags (used for mood filter pills): `cinematic`, `warm`, `calm`, `upbeat`, `modern`, `luxury`. Add new tags freely — they'll appear automatically in the filter row.

---

## Deployment to Vercel

```bash
cd music-picker
git init
git add .
git commit -m "init"
gh repo create gold-flower-music-picker --public --source=. --push
npx vercel --yes
```

### Custom Subdomain

1. In Vercel → your project → **Settings → Domains**
2. Add `music.goldflowermedia.com`
3. In your DNS provider, add a CNAME record:
   - **Name:** `music`
   - **Value:** `cname.vercel-dns.com`

---

## Formspree Endpoint

Current value in `src/App.jsx`:
```
FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID'
```
Replace `YOUR_FORM_ID` before going live.
