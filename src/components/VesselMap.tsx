import { useEffect, useRef } from 'react'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Box } from '@chakra-ui/react'
import { useVesselStore } from '../store/vesselStore'
import { vesselsToGeoJSON } from '../lib/vesselGeoJson'
import { createVesselIcon } from '../lib/vesselIcon'
import { createGeoCircle } from '../lib/geoCircle'
import { STALENESS_COLOR, getStaleness } from '../lib/staleness'
import type { FeatureCollection, Point } from 'geojson'

const VESSEL_SOURCE_ID = 'vessels'
const VESSEL_LAYER_ID = 'vessels-layer'
const UNCERTAINTY_SOURCE_ID = 'uncertainty-circle'
const UNCERTAINTY_FILL_LAYER_ID = 'uncertainty-circle-fill'
const UNCERTAINTY_LINE_LAYER_ID = 'uncertainty-circle-line'
const GRAND_BANKS_CENTER: [number, number] = [-51, 46]
const STALENESS_TICK_MS = 10_000
const CIRCLE_TICK_MS = 1_000
const NM_TO_METERS = 1852

const EMPTY_FEATURE_COLLECTION: FeatureCollection<Point> = { type: 'FeatureCollection', features: [] }

export function VesselMap() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: GRAND_BANKS_CENTER,
      zoom: 5,
    })

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')

    const syncSource = () => {
      const source = map.getSource(VESSEL_SOURCE_ID) as maplibregl.GeoJSONSource | undefined
      if (!source) return
      source.setData(vesselsToGeoJSON(useVesselStore.getState().vessels, Date.now()))
    }

    const syncUncertaintyCircle = () => {
      const source = map.getSource(UNCERTAINTY_SOURCE_ID) as maplibregl.GeoJSONSource | undefined
      if (!source) return

      const { selectedMmsi, vessels } = useVesselStore.getState()
      const vessel = selectedMmsi == null ? undefined : vessels.find((v) => v.mmsi === selectedMmsi)
      if (!vessel) {
        source.setData(EMPTY_FEATURE_COLLECTION)
        return
      }

      const now = Date.now()
      const elapsedHours = (now - vessel.lastSeen) / 3_600_000
      const radiusMeters = vessel.sog * elapsedHours * NM_TO_METERS
      const circle = createGeoCircle(vessel.lat, vessel.lon, radiusMeters)
      circle.properties = { staleness: getStaleness(vessel.lastSeen, now) }
      source.setData({ type: 'FeatureCollection', features: [circle] })
    }

    map.on('load', () => {
      map.addImage('vessel-arrow', createVesselIcon(24), { sdf: true })

      map.addSource(UNCERTAINTY_SOURCE_ID, { type: 'geojson', data: EMPTY_FEATURE_COLLECTION })

      map.addLayer({
        id: UNCERTAINTY_FILL_LAYER_ID,
        type: 'fill',
        source: UNCERTAINTY_SOURCE_ID,
        paint: {
          'fill-color': [
            'match',
            ['get', 'staleness'],
            'fresh',
            STALENESS_COLOR.fresh,
            'aging',
            STALENESS_COLOR.aging,
            'stale',
            STALENESS_COLOR.stale,
            STALENESS_COLOR.dropped,
          ],
          'fill-opacity': 0.15,
        },
      })

      map.addLayer({
        id: UNCERTAINTY_LINE_LAYER_ID,
        type: 'line',
        source: UNCERTAINTY_SOURCE_ID,
        paint: {
          'line-color': [
            'match',
            ['get', 'staleness'],
            'fresh',
            STALENESS_COLOR.fresh,
            'aging',
            STALENESS_COLOR.aging,
            'stale',
            STALENESS_COLOR.stale,
            STALENESS_COLOR.dropped,
          ],
          'line-width': 1.5,
          'line-opacity': 0.8,
        },
      })

      map.addSource(VESSEL_SOURCE_ID, {
        type: 'geojson',
        data: vesselsToGeoJSON(useVesselStore.getState().vessels, Date.now()),
      })

      map.addLayer({
        id: VESSEL_LAYER_ID,
        type: 'symbol',
        source: VESSEL_SOURCE_ID,
        layout: {
          'icon-image': 'vessel-arrow',
          'icon-size': 0.7,
          'icon-rotate': ['get', 'heading'],
          'icon-rotation-alignment': 'map',
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
        },
        paint: {
          'icon-color': [
            'match',
            ['get', 'staleness'],
            'fresh',
            STALENESS_COLOR.fresh,
            'aging',
            STALENESS_COLOR.aging,
            'stale',
            STALENESS_COLOR.stale,
            'dropped',
            STALENESS_COLOR.dropped,
            STALENESS_COLOR.fresh,
          ],
          'icon-opacity': [
            'match',
            ['get', 'staleness'],
            'fresh',
            1,
            'aging',
            0.85,
            'stale',
            0.55,
            'dropped',
            0.4,
            1,
          ],
        },
      })

      map.on('click', VESSEL_LAYER_ID, (e: maplibregl.MapLayerMouseEvent) => {
        const feature = e.features?.[0]
        if (!feature) return
        const mmsi = feature.properties?.mmsi as number
        useVesselStore.getState().setSelectedMmsi(mmsi)
      })

      map.on('mouseenter', VESSEL_LAYER_ID, () => {
        map.getCanvas().style.cursor = 'pointer'
      })
      map.on('mouseleave', VESSEL_LAYER_ID, () => {
        map.getCanvas().style.cursor = ''
      })
    })

    // Vessel position/lastSeen changes (dead-reckoning ticks) update the map immediately.
    const unsubscribe = useVesselStore.subscribe(() => {
      syncSource()
      syncUncertaintyCircle()
    })

    // Staleness ages purely with elapsed time, independent of position ticks, so
    // frozen (non-broadcasting) vessels still need a periodic resync to shift buckets.
    const staleTimer = setInterval(syncSource, STALENESS_TICK_MS)

    // The uncertainty circle's radius grows continuously with elapsed time, so it
    // gets its own faster tick to read as smooth growth rather than jumpy 10s steps.
    const circleTimer = setInterval(syncUncertaintyCircle, CIRCLE_TICK_MS)

    return () => {
      unsubscribe()
      clearInterval(staleTimer)
      clearInterval(circleTimer)
      map.remove()
    }
  }, [])

  return <Box ref={containerRef} w="100%" h="100%" />
}
