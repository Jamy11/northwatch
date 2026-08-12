import { Box, Flex, Text } from '@chakra-ui/react'
import { STALENESS_COLOR, STALENESS_LABEL } from '../lib/staleness'
import type { StalenessBucket } from '../types/vessel'

const ORDER: Array<{ bucket: StalenessBucket; hint: string }> = [
  { bucket: 'fresh', hint: '<3 min' },
  { bucket: 'aging', hint: '<10 min' },
  { bucket: 'stale', hint: '<30 min' },
  { bucket: 'dropped', hint: '≥30 min, off map' },
]

export function StalenessLegend() {
  return (
    <Box
      position="absolute"
      bottom={4}
      left={4}
      bg="bg.panel"
      border="1px solid"
      borderColor="border.subtle"
      borderRadius="md"
      px={3}
      py={2}
      pointerEvents="none"
    >
      <Flex direction="column" gap={1}>
        {ORDER.map(({ bucket, hint }) => (
          <Flex key={bucket} align="center" gap={2}>
            <Box
              w="10px"
              h="10px"
              borderRadius="full"
              bg={STALENESS_COLOR[bucket]}
              flexShrink={0}
            />
            <Text fontSize="xs" color="gray.300">
              {STALENESS_LABEL[bucket]}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {hint}
            </Text>
          </Flex>
        ))}
      </Flex>
    </Box>
  )
}
