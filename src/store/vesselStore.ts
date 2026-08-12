import { create } from 'zustand'
import type { Vessel } from '../types/vessel'
import { generateVessels } from '../lib/generateVessels'
import { advancePosition } from '../lib/deadReckoning'

interface VesselState {
  vessels: Vessel[]
  selectedMmsi: number | null
  setSelectedMmsi: (mmsi: number | null) => void
  tick: (dtMs: number) => void
}

export const useVesselStore = create<VesselState>((set) => ({
  vessels: generateVessels(150),
  selectedMmsi: null,
  setSelectedMmsi: (mmsi) => set({ selectedMmsi: mmsi }),
  tick: (dtMs) =>
    set((state) => {
      const now = Date.now()
      const dtHours = dtMs / 3_600_000
      const vessels = state.vessels.map((v): Vessel => {
        if (!v.broadcasting) return v
        if (v.sog <= 0) return { ...v, lastSeen: now }
        const { lat, lon } = advancePosition(v.lat, v.lon, v.sog, v.cog, dtHours)
        return { ...v, lat, lon, lastSeen: now }
      })
      return { vessels }
    }),
}))
