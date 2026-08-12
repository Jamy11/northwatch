import { useEffect, useRef } from 'react'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Box } from '@chakra-ui/react'
import { useVesselStore } from '../store/vesselStore'
import { vesselsToGeoJSON } from '../lib/vesselGeoJson'
import { createVesselIcon } from '../lib/vesselIcon'

const VESSEL_SOURCE_ID = 'vessels'
const VESSEL_LAYER_ID = 'vessels-layer'
const GRAND_BANKS_CENTER: [number, number] = [-51, 46]

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

    map.on('load', () => {
      map.addImage('vessel-arrow', createVesselIcon(24), { sdf: true })

      map.addSource(VESSEL_SOURCE_ID, {
        type: 'geojson',
        data: vesselsToGeoJSON(useVesselStore.getState().vessels),
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
          'icon-color': '#4ADE80',
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

    const unsubscribe = useVesselStore.subscribe((state) => {
      const source = map.getSource(VESSEL_SOURCE_ID) as maplibregl.GeoJSONSource | undefined
      if (!source) return
      source.setData(vesselsToGeoJSON(state.vessels))
    })

    return () => {
      unsubscribe()
      map.remove()
    }
  }, [])

  return <Box ref={containerRef} w="100%" h="100%" />
}
