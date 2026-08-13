import { useCallback, useRef, useState } from 'react'
import { Box, Flex, Heading, Text } from '@chakra-ui/react'
import { VesselMap } from './components/VesselMap'
import { StalenessLegend } from './components/StalenessLegend'
import { ContactTable } from './components/ContactTable'
import { HeaderStats } from './components/HeaderStats'
import { useSimulationClock } from './hooks/useSimulationClock'

const MIN_PANEL_WIDTH = 280
const MAX_PANEL_WIDTH = 680
const DEFAULT_PANEL_WIDTH = 420

function App() {
  useSimulationClock()
  const [panelWidth, setPanelWidth] = useState(DEFAULT_PANEL_WIDTH)
  const draggingRef = useRef(false)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    draggingRef.current = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!draggingRef.current) return
      const width = window.innerWidth - moveEvent.clientX
      setPanelWidth(Math.min(MAX_PANEL_WIDTH, Math.max(MIN_PANEL_WIDTH, width)))
    }

    const handleMouseUp = () => {
      draggingRef.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }, [])

  return (
    <Flex direction="column" h="100vh" bg="bg.canvas" color="gray.100">
      <Flex
        as="header"
        align="center"
        px={4}
        h="56px"
        flexShrink={0}
        bg="bg.panel"
        borderBottom="1px solid"
        borderColor="border.subtle"
      >
        <Heading size="md" letterSpacing="wide" color="gray.100">
          NORTHWATCH
        </Heading>
        <Text ml={3} fontSize="sm" color="gray.500">
          Grand Banks — Maritime Domain Awareness
        </Text>
        <HeaderStats />
      </Flex>

      <Flex flex={1} minH={0}>
        <Box flex={1} bg="bg.canvas" position="relative">
          <VesselMap />
          <StalenessLegend />
        </Box>

        <Box
          w="6px"
          flexShrink={0}
          cursor="col-resize"
          bg="border.subtle"
          _hover={{ bg: 'gray.500' }}
          onMouseDown={handleMouseDown}
        />

        <Box w={`${panelWidth}px`} minW={0} flexShrink={0} bg="bg.panel" overflow="hidden">
          <ContactTable />
        </Box>
      </Flex>
    </Flex>
  )
}

export default App
