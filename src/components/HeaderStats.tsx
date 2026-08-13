import { Box, Flex, Text } from '@chakra-ui/react'
import { useVesselStore } from '../store/vesselStore'
import { useNow } from '../hooks/useNow'
import { getStaleness, STALENESS_COLOR, STALENESS_LABEL } from '../lib/staleness'
import type { StalenessBucket } from '../types/vessel'

const ORDER: StalenessBucket[] = ['fresh', 'aging', 'stale', 'dropped']

export function HeaderStats() {
  const vessels = useVesselStore((s) => s.vessels)
  const now = useNow(10_000)

  const counts: Record<StalenessBucket, number> = { fresh: 0, aging: 0, stale: 0, dropped: 0 }
  for (const v of vessels) {
    counts[getStaleness(v.lastSeen, now)]++
  }

  return (
    <Flex align="center" gap={5} ml="auto">
      <Text fontSize="sm" color="gray.300">
        {vessels.length} contacts
      </Text>
      <Flex align="center" gap={3}>
        {ORDER.map((bucket) => (
          <Flex key={bucket} align="center" gap={1.5}>
            <Box w="8px" h="8px" borderRadius="full" bg={STALENESS_COLOR[bucket]} flexShrink={0} />
            <Text fontSize="xs" color="gray.400">
              {counts[bucket]} {STALENESS_LABEL[bucket]}
            </Text>
          </Flex>
        ))}
      </Flex>
    </Flex>
  )
}
