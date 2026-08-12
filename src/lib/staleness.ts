import type { StalenessBucket } from '../types/vessel'

const MINUTE = 60_000

export function getStaleness(lastSeen: number, now: number): StalenessBucket {
  const elapsedMin = (now - lastSeen) / MINUTE
  if (elapsedMin < 3) return 'fresh'
  if (elapsedMin < 10) return 'aging'
  if (elapsedMin < 30) return 'stale'
  return 'dropped'
}

export const STALENESS_LABEL: Record<StalenessBucket, string> = {
  fresh: 'Fresh',
  aging: 'Aging',
  stale: 'Stale',
  dropped: 'Dropped',
}

export const STALENESS_COLOR: Record<StalenessBucket, string> = {
  fresh: '#4ADE80',
  aging: '#FACC15',
  stale: '#F97316',
  dropped: '#64748B',
}
