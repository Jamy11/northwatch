export type ShipType =
  | 'Fishing'
  | 'Cargo'
  | 'Tanker'
  | 'Tug'
  | 'Research'
  | 'Passenger'
  | 'Military'
  | 'Pleasure Craft'

export interface Vessel {
  mmsi: number
  name: string
  shipType: ShipType
  lat: number
  lon: number
  sog: number
  cog: number
  heading: number
  lastSeen: number
  broadcasting: boolean
}

export type StalenessBucket = 'fresh' | 'aging' | 'stale' | 'dropped'
