import type { Feature, Polygon } from 'geojson'

const EARTH_RADIUS_M = 6_371_000
const DEG2RAD = Math.PI / 180
const RAD2DEG = 180 / Math.PI

// Great-circle destination point formula, used to trace a geodesic ring so the
// circle reads as a correct real-world radius at any latitude/zoom rather than
// a fixed pixel size (which is what MapLibre's circle-radius paint gives you).
export function createGeoCircle(
  lat: number,
  lon: number,
  radiusMeters: number,
  points = 64,
): Feature<Polygon> {
  const angularDistance = radiusMeters / EARTH_RADIUS_M
  const lat1 = lat * DEG2RAD
  const lon1 = lon * DEG2RAD

  const ring: [number, number][] = []
  for (let i = 0; i <= points; i++) {
    const bearing = (i / points) * 2 * Math.PI
    const lat2 = Math.asin(
      Math.sin(lat1) * Math.cos(angularDistance) +
        Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearing),
    )
    const lon2 =
      lon1 +
      Math.atan2(
        Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(lat1),
        Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2),
      )
    ring.push([lon2 * RAD2DEG, lat2 * RAD2DEG])
  }

  return {
    type: 'Feature',
    properties: {},
    geometry: { type: 'Polygon', coordinates: [ring] },
  }
}
