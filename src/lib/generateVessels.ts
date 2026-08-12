import type { ShipType, Vessel } from '../types/vessel'
import { isOnLand } from './landmask'

// AIS report cadence per vessel: 5s-5min, randomized independently of lastSeen's
// initial age so staggered refreshes don't wash out the deliberate staleness spread.
export const REPORT_INTERVAL_RANGE_MS: [number, number] = [5_000, 300_000]

// Maritime Identification Digits seen in North Atlantic / Grand Banks traffic.
const MID_POOL = [
  316, // Canada
  366, 367, 368, 369, // USA
  232, 233, 234, 235, // UK
  226, 227, 228, // France
  257, 258, 259, // Norway
  224, 225, // Spain
  263, // Portugal
  211, 218, // Germany
  636, // Liberia
  351, 352, 353, 354, // Panama
  273, // Russia
  219, // Denmark
]

const SHIP_TYPE_WEIGHTS: Array<[ShipType, number]> = [
  ['Fishing', 0.4],
  ['Cargo', 0.22],
  ['Tanker', 0.12],
  ['Tug', 0.07],
  ['Research', 0.06],
  ['Passenger', 0.05],
  ['Military', 0.04],
  ['Pleasure Craft', 0.04],
]

const SOG_RANGE_BY_TYPE: Record<ShipType, [number, number]> = {
  Fishing: [0, 9],
  Cargo: [10, 18],
  Tanker: [9, 16],
  Tug: [4, 12],
  Research: [3, 13],
  Passenger: [8, 18],
  Military: [6, 18],
  'Pleasure Craft': [2, 14],
}

const FISHING_NAMES = [
  'Cape Race', 'Grand Bank Provider', 'Atlantic Venture', 'Northern Endeavour',
  'Ocean Ranger II', 'Miss Terra Nova', 'Sea Fox', 'Silver Spray',
  'Twillingate Star', 'Bonavista Pride', 'Fogo Island Runner', 'Labrador Mist',
  'Cape Spear', 'Herring Gull', 'Trinity Venture', 'Petty Harbour Lass',
  'Nor easter', 'Iceberg Alley', 'Southern Shore', 'Placentia Wind',
]

const CARGO_NAMES = [
  'MSC Halifax', 'Maersk Avalon', 'Atlantic Carrier', 'Nordic Trader',
  'CMA CGM Labrador', 'Evergreen Fortune', 'Hapag Bay', 'Oceanex Sanderling',
  'St Lawrence Star', 'Cabot Strait Voyager', 'Bay Breeze', 'Harmony Wave',
  'Northern Light Carrier', 'Baltic Endeavor', 'Trans Atlantic Pride',
]

const TANKER_NAMES = [
  'Whitecap Tanker', 'Grand Banks Crude I', 'Terra Nova FPSO Support',
  'Hibernia Tide', 'North Star Products', 'Cabot Tanker', 'Atlantic Refiner',
  'Placentia Bay Carrier', 'Come By Chance Trader',
]

const TUG_NAMES = [
  'Point Rich', 'Harbour Guardian', 'St John’s Tug 4', 'Cape Bonavista Tow',
  'Salvage Chief', 'Atlantic Hauler',
]

const RESEARCH_NAMES = [
  'CCGS Cape Roger', 'CCGS Teleost', 'NRV Alliance', 'Celtic Explorer',
  'Coriolis II', 'Atlantic Surveyor',
]

const PASSENGER_NAMES = [
  'MV Legionnaire', 'Marine Voyager', 'Osprey Wanderer', 'Northern Star Ferry',
]

const MILITARY_NAMES = [
  'HMCS Fredericton', 'HMCS Charlottetown', 'HMCS Margaret Brooke', 'HMCS Ville de Quebec',
]

const PLEASURE_NAMES = [
  'Second Wind', 'Salt Air', 'Northbound', 'Fair Winds', 'Sea Glass',
]

const NAME_POOL_BY_TYPE: Record<ShipType, string[]> = {
  Fishing: FISHING_NAMES,
  Cargo: CARGO_NAMES,
  Tanker: TANKER_NAMES,
  Tug: TUG_NAMES,
  Research: RESEARCH_NAMES,
  Passenger: PASSENGER_NAMES,
  Military: MILITARY_NAMES,
  'Pleasure Craft': PLEASURE_NAMES,
}

function pickWeighted<T>(pool: Array<[T, number]>): T {
  const total = pool.reduce((sum, [, w]) => sum + w, 0)
  let r = Math.random() * total
  for (const [item, w] of pool) {
    r -= w
    if (r <= 0) return item
  }
  return pool[pool.length - 1][0]
}

function randInRange([min, max]: [number, number]): number {
  return min + Math.random() * (max - min)
}

function generateMmsi(used: Set<number>): number {
  let mmsi: number
  do {
    const mid = MID_POOL[Math.floor(Math.random() * MID_POOL.length)]
    const suffix = Math.floor(Math.random() * 1_000_000)
      .toString()
      .padStart(6, '0')
    mmsi = Number(`${mid}${suffix}`)
  } while (used.has(mmsi))
  used.add(mmsi)
  return mmsi
}

const usedNames = new Set<string>()

function generateSeaPosition(): { lat: number; lon: number } {
  let lat: number
  let lon: number
  let attempts = 0
  do {
    lat = 42 + Math.random() * 10
    lon = -(46 + Math.random() * 14)
    attempts++
  } while (isOnLand(lat, lon) && attempts < 50)
  return { lat, lon }
}

function generateName(shipType: ShipType): string {
  const pool = NAME_POOL_BY_TYPE[shipType]
  const available = pool.filter((n) => !usedNames.has(n))
  const name = available.length > 0
    ? available[Math.floor(Math.random() * available.length)]
    : `${pool[Math.floor(Math.random() * pool.length)]} ${Math.floor(Math.random() * 90 + 10)}`
  usedNames.add(name)
  return name
}

const MIN_DROPPED = 10

export function generateVessels(count = 100): Vessel[] {
  const used = new Set<number>()
  const now = Date.now()
  const vessels: Vessel[] = []

  for (let i = 0; i < count; i++) {
    const shipType = pickWeighted(SHIP_TYPE_WEIGHTS)
    const { lat, lon } = generateSeaPosition()
    const sog = Math.round(randInRange(SOG_RANGE_BY_TYPE[shipType]) * 10) / 10
    const cog = Math.round(Math.random() * 359)

    // Reserve the first MIN_DROPPED vessels as guaranteed-dropped: permanently
    // off the air, last seen 30-90 min ago, so the map always shows some gray.
    const forceDropped = i < MIN_DROPPED
    const ageMinutes = forceDropped ? 30 + Math.random() * 60 : Math.pow(Math.random(), 2) * 60
    const lastSeen = now - ageMinutes * 60_000
    const broadcasting = forceDropped ? false : Math.random() >= 0.15
    const nextReportDue = now + randInRange(REPORT_INTERVAL_RANGE_MS)

    vessels.push({
      mmsi: generateMmsi(used),
      name: generateName(shipType),
      shipType,
      lat,
      lon,
      sog,
      cog,
      heading: cog,
      lastSeen,
      broadcasting,
      nextReportDue,
    })
  }

  return vessels
}
