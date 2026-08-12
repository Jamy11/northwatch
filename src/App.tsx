import { Box, Flex, Heading, Text } from '@chakra-ui/react'
import { VesselMap } from './components/VesselMap'
import { StalenessLegend } from './components/StalenessLegend'
import { useSimulationClock } from './hooks/useSimulationClock'

function App() {
  useSimulationClock()

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
      </Flex>

      <Flex flex={1} minH={0}>
        <Box flex={1} bg="bg.canvas" position="relative">
          <VesselMap />
          <StalenessLegend />
        </Box>
        <Box
          w="420px"
          flexShrink={0}
          bg="bg.panel"
          borderLeft="1px solid"
          borderColor="border.subtle"
        />
      </Flex>
    </Flex>
  )
}

export default App
