import type { FeatureCollection, Point } from 'geojson'
import type { Vessel } from '../types/vessel'
import { getStaleness } from './staleness'

export function vesselsToGeoJSON(vessels: Vessel[], now: number): FeatureCollection<Point> {
  const features = vessels
    .map((v) => ({ v, staleness: getStaleness(v.lastSeen, now) }))
    .map(({ v, staleness }) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [v.lon, v.lat] },
      properties: {
        mmsi: v.mmsi,
        name: v.name,
        shipType: v.shipType,
        sog: v.sog,
        cog: v.cog,
        heading: v.heading,
        lastSeen: v.lastSeen,
        staleness,
      },
    }))

  return { type: 'FeatureCollection', features }
}
