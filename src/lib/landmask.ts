// Coarse rectangular approximation of Newfoundland (+ St-Pierre et Miquelon) used
// to keep synthetic vessel positions off land. Deliberately generous/blocky —
// bays are treated as land for simplicity since this dashboard focuses on
// open-ocean Grand Banks traffic, not inshore navigation.
interface LandBox {
  lonMin: number
  lonMax: number
  latMin: number
  latMax: number
}

const LAND_BOXES: LandBox[] = [
  { lonMin: -53.9, lonMax: -52.4, latMin: 46.3, latMax: 48.2 }, // Avalon Peninsula (incl. Cape Race / Mistaken Point arm)
  { lonMin: -53.9, lonMax: -52.9, latMin: 48.2, latMax: 48.85 }, // Bonavista Peninsula/Bay
  { lonMin: -55.95, lonMax: -54.9, latMin: 46.8, latMax: 47.9 }, // Burin Peninsula
  { lonMin: -58.6, lonMax: -53.9, latMin: 47.4, latMax: 49.8 }, // Central main body
  { lonMin: -57.7, lonMax: -55.3, latMin: 49.6, latMax: 51.65 }, // Northern Peninsula
  { lonMin: -59.0, lonMax: -58.4, latMin: 48.4, latMax: 48.8 }, // Port au Port Peninsula
  { lonMin: -59.5, lonMax: -58.9, latMin: 47.5, latMax: 48.1 }, // Port aux Basques / SW corner
  { lonMin: -56.45, lonMax: -56.15, latMin: 46.75, latMax: 46.95 }, // St-Pierre et Miquelon
  { lonMin: -57.7, lonMax: -55.3, latMin: 51.2, latMax: 52.6 }, // Southern Labrador coast / Strait of Belle Isle
  { lonMin: -60.0, lonMax: -57.6, latMin: 50.2, latMax: 52.6 }, // Quebec Lower North Shore
  { lonMin: -61.6, lonMax: -59.2, latMin: 45.5, latMax: 47.05 }, // Cape Breton Island
]

export function isOnLand(lat: number, lon: number): boolean {
  return LAND_BOXES.some(
    (box) => lon >= box.lonMin && lon <= box.lonMax && lat >= box.latMin && lat <= box.latMax,
  )
}
