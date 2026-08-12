import { create } from 'zustand'
import type { Vessel } from '../types/vessel'
import { generateVessels, REPORT_INTERVAL_RANGE_MS } from '../lib/generateVessels'
import { advancePosition } from '../lib/deadReckoning'

function randInRange([min, max]: [number, number]): number {
  return min + Math.random() * (max - min)
}

interface VesselState {
  vessels: Vessel[]
  selectedMmsi: number | null
  setSelectedMmsi: (mmsi: number | null) => void
  tick: (dtMs: number) => void
}

export const useVesselStore = create<VesselState>((set) => ({
  vessels: generateVessels(100),
  selectedMmsi: null,
  setSelectedMmsi: (mmsi) => set({ selectedMmsi: mmsi }),
  tick: (dtMs) =>
    set((state) => {
      const now = Date.now()
      const dtHours = dtMs / 3_600_000
      const vessels = state.vessels.map((v): Vessel => {
        if (!v.broadcasting) return v
        const { lat, lon } = advancePosition(v.lat, v.lon, v.sog, v.cog, dtHours)
        if (now >= v.nextReportDue) {
          return { ...v, lat, lon, lastSeen: now, nextReportDue: now + randInRange(REPORT_INTERVAL_RANGE_MS) }
        }
        return { ...v, lat, lon }
      })
      return { vessels }
    }),
}))
