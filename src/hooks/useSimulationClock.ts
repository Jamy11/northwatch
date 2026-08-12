import { useEffect, useRef } from 'react'
import { useVesselStore } from '../store/vesselStore'

export function useSimulationClock(intervalMs = 3000): void {
  const tick = useVesselStore((s) => s.tick)
  const lastRef = useRef(Date.now())

  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now()
      const dt = now - lastRef.current
      lastRef.current = now
      tick(dt)
    }, intervalMs)
    return () => clearInterval(id)
  }, [intervalMs, tick])
}
