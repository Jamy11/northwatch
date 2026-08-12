# NorthWatch

A synthetic maritime domain awareness (MDA) dashboard for the Grand Banks off Newfoundland. No backend — a client-side simulation clock drives ~150 synthetic AIS contacts across a live MapLibre map.

## Stack

- Vite + React 18 + TypeScript (strict)
- MapLibre GL JS
- Chakra UI v3 (`createSystem` / `defineConfig`)
- Zustand

## Features

- ~150 synthetic vessels (realistic MMSIs, names, ship types) scattered across the Grand Banks (42–52N, 46–60W), kept off land by a coastline mask
- Dark-themed MapLibre map (CARTO dark-matter basemap) with vessels rendered as a GeoJSON symbol layer rotated by heading, updated imperatively via `setData()` so the map never re-renders through React
- In-browser dead-reckoning simulation clock advancing vessel positions and `lastSeen`; ~15% of vessels stop broadcasting so they visibly age over the session
- *(in progress)* Derived AIS-contact staleness (fresh / aging / stale / dropped), growing uncertainty circles around selected contacts, and a sortable/filterable contact table synced to the map selection

## Running locally

```bash
npm install
npm run dev
```

## Status

Built as a scoped, single-day portfolio project — prioritizing a few features done well over broad coverage.
