# Launch Atlas

**Global satellite launch cadence by country, 2000–2025.**  
Reusable rockets, new entrants, China's rise. A data visualization project by [Apogee](https://apogee-review.vercel.app).

---

## Stack

| Layer | Choice |
|---|---|
| Build | Vite 5 |
| Framework | React 18 + TypeScript |
| Visualization | D3.js v7 |
| Styling | CSS Modules + IBM Plex design tokens |
| Routing | React Router v6 |
| Data | Launch Library 2 API (The Space Devs) |
| Deployment | Vercel |

---

## Pages

### `/` — Bar Chart Race
Animated cumulative launch count race across 8 country/provider buckets, 2000–2025.  
- Auto-play with scrubable timeline
- Smooth D3 rank transitions
- Story beat annotations

### `/detail` — Annual Line Chart
Per-year launch counts with full interactivity:
- Country toggle buttons
- Year range filter (dual-handle)
- Hover tooltip
- Summary stats + breakdown table

---

## Data

Data is fetched at runtime from [Launch Library 2](https://ll.thespacedevs.com/2.2.0/) — a free, community-maintained launch database. Results are session-cached for 24 hours to respect rate limits.

If the API is unavailable, the app falls back to a curated static dataset covering all 8 entities × 2000–2025.

### Country buckets

| Bucket | Includes |
|---|---|
| **SpaceX** | SpaceX (separated to highlight the reuse revolution) |
| **USA** | ULA, Northrop Grumman, Rocket Lab (US), other US providers |
| **Russia** | Roscosmos, Soviet legacy records, Baikonur-attributed launches |
| **China** | CASC, CASIC, CALT, commercial Chinese providers |
| **Europe** | Arianespace, ESA member states |
| **Japan** | JAXA, MHI |
| **India** | ISRO |
| **Other** | All remaining |

---

## Development

```bash
npm install
npm run dev       # localhost:5173
npm run build     # production build → dist/
npm run preview   # preview production build
```

## Deployment

```bash
# First time
vercel

# Subsequent
vercel --prod
```

Set the Vercel project name to `launch-atlas` and link as a subdomain:  
`launch-atlas.vercel.app` → link from Apogee nav as `Launch Atlas ↗`

---

## Connecting to Apogee

Add to Apogee's nav (`/src/components/Nav.tsx`):

```tsx
<a
  href="https://launch-atlas.vercel.app"
  target="_blank"
  rel="noopener noreferrer"
>
  Launch Atlas ↗
</a>
```

The shared IBM Plex type system and token naming makes both sites read as the same brand.

---

*Built as part of the Apogee brand extension — same organization, different energy.*
