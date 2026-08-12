import type { FeatureCollection, Point } from 'geojson'
import type { Vessel } from '../types/vessel'

export function vesselsToGeoJSON(vessels: Vessel[]): FeatureCollection<Point> {
  return {
    type: 'FeatureCollection',
    features: vessels.map((v) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [v.lon, v.lat] },
      properties: {
        mmsi: v.mmsi,
        name: v.name,
        shipType: v.shipType,
        sog: v.sog,
        cog: v.cog,
        heading: v.heading,
        lastSeen: v.lastSeen,
      },
    })),
  }
}
