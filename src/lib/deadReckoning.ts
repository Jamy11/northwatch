const NM_PER_DEGREE_LAT = 60
const DEG2RAD = Math.PI / 180

export function advancePosition(
  lat: number,
  lon: number,
  sogKnots: number,
  cogDegrees: number,
  dtHours: number,
): { lat: number; lon: number } {
  const distanceNm = sogKnots * dtHours
  const cogRad = cogDegrees * DEG2RAD

  const deltaLat = (distanceNm * Math.cos(cogRad)) / NM_PER_DEGREE_LAT
  const nmPerDegreeLon = NM_PER_DEGREE_LAT * Math.cos(lat * DEG2RAD)
  const deltaLon = (distanceNm * Math.sin(cogRad)) / nmPerDegreeLon

  return { lat: lat + deltaLat, lon: lon + deltaLon }
}
