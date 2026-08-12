import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        rawCanvas: { value: '#0B0F14' },
        rawPanel: { value: '#131A22' },
        rawBorder: { value: '#1F2A35' },
        fresh: { value: '#4ADE80' },
        aging: { value: '#FACC15' },
        stale: { value: '#F97316' },
        dropped: { value: '#64748B' },
      },
      fonts: {
        heading: { value: `'Inter', system-ui, sans-serif` },
        body: { value: `'Inter', system-ui, sans-serif` },
        mono: { value: `'JetBrains Mono', ui-monospace, monospace` },
      },
    },
    semanticTokens: {
      colors: {
        bg: {
          canvas: { value: '{colors.rawCanvas}' },
          panel: { value: '{colors.rawPanel}' },
        },
        border: {
          subtle: { value: '{colors.rawBorder}' },
        },
        status: {
          fresh: { value: '{colors.fresh}' },
          aging: { value: '{colors.aging}' },
          stale: { value: '{colors.stale}' },
          dropped: { value: '{colors.dropped}' },
        },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)
