import { useEffect, useMemo, useRef, useState } from 'react'
import { Badge, Box, Button, Flex, Table, Text } from '@chakra-ui/react'
import { useVesselStore } from '../store/vesselStore'
import { useNow } from '../hooks/useNow'
import { getStaleness, STALENESS_COLOR, STALENESS_LABEL } from '../lib/staleness'
import type { StalenessBucket } from '../types/vessel'

type SortField = 'mmsi' | 'name' | 'shipType' | 'sog' | 'cog' | 'lastSeen'
type SortDirection = 'asc' | 'desc'

const ALL_BUCKETS: StalenessBucket[] = ['fresh', 'aging', 'stale', 'dropped']

const COLUMNS: Array<{ field: SortField; label: string }> = [
  { field: 'mmsi', label: 'MMSI' },
  { field: 'name', label: 'Name' },
  { field: 'shipType', label: 'Type' },
  { field: 'sog', label: 'SOG' },
  { field: 'cog', label: 'COG' },
  { field: 'lastSeen', label: 'Last Seen' },
]

function formatTimeAgo(lastSeen: number, now: number): string {
  const minutes = Math.floor((now - lastSeen) / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ${minutes % 60}m ago`
}

export function ContactTable() {
  const vessels = useVesselStore((s) => s.vessels)
  const selectedMmsi = useVesselStore((s) => s.selectedMmsi)
  const selectFromTable = useVesselStore((s) => s.selectFromTable)
  const now = useNow(10_000)

  const [sortField, setSortField] = useState<SortField>('lastSeen')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [activeBuckets, setActiveBuckets] = useState<Set<StalenessBucket>>(new Set(ALL_BUCKETS))

  const bodyRef = useRef<HTMLTableSectionElement>(null)

  const rows = useMemo(() => {
    const withStaleness = vessels.map((v) => ({ vessel: v, staleness: getStaleness(v.lastSeen, now) }))
    const filtered = withStaleness.filter(({ staleness }) => activeBuckets.has(staleness))
    const dir = sortDirection === 'asc' ? 1 : -1
    return filtered.sort((a, b) => {
      switch (sortField) {
        case 'mmsi':
          return (a.vessel.mmsi - b.vessel.mmsi) * dir
        case 'name':
          return a.vessel.name.localeCompare(b.vessel.name) * dir
        case 'shipType':
          return a.vessel.shipType.localeCompare(b.vessel.shipType) * dir
        case 'sog':
          return (a.vessel.sog - b.vessel.sog) * dir
        case 'cog':
          return (a.vessel.cog - b.vessel.cog) * dir
        case 'lastSeen':
          return (a.vessel.lastSeen - b.vessel.lastSeen) * dir
      }
    })
  }, [vessels, now, activeBuckets, sortField, sortDirection])

  useEffect(() => {
    if (selectedMmsi == null || !bodyRef.current) return
    const row = bodyRef.current.querySelector<HTMLElement>(`[data-mmsi="${selectedMmsi}"]`)
    row?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [selectedMmsi])

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  function toggleBucket(bucket: StalenessBucket) {
    setActiveBuckets((prev) => {
      const next = new Set(prev)
      if (next.has(bucket)) next.delete(bucket)
      else next.add(bucket)
      return next.size === 0 ? prev : next
    })
  }

  return (
    <Flex direction="column" h="100%" minH={0}>
      <Flex gap={2} p={3} borderBottom="1px solid" borderColor="border.subtle" wrap="wrap">
        {ALL_BUCKETS.map((bucket) => {
          const active = activeBuckets.has(bucket)
          return (
            <Button
              key={bucket}
              size="xs"
              variant="outline"
              onClick={() => toggleBucket(bucket)}
              opacity={active ? 1 : 0.4}
              borderColor={STALENESS_COLOR[bucket]}
              color={STALENESS_COLOR[bucket]}
            >
              {STALENESS_LABEL[bucket]}
            </Button>
          )
        })}
      </Flex>

      <Box flex={1} minH={0} overflowY="auto">
        <Table.Root size="sm" stickyHeader variant="line" color="gray.200">
          <Table.Header>
            <Table.Row bg="bg.panel">
              {COLUMNS.map(({ field, label }) => (
                <Table.ColumnHeader
                  key={field}
                  cursor="pointer"
                  userSelect="none"
                  color="gray.400"
                  onClick={() => toggleSort(field)}
                >
                  {label}
                  {sortField === field ? (sortDirection === 'asc' ? ' ▲' : ' ▼') : ''}
                </Table.ColumnHeader>
              ))}
              <Table.ColumnHeader color="gray.400">Status</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body ref={bodyRef}>
            {rows.map(({ vessel, staleness }) => (
              <Table.Row
                key={vessel.mmsi}
                data-mmsi={vessel.mmsi}
                onClick={() => selectFromTable(vessel.mmsi)}
                cursor="pointer"
                bg={selectedMmsi === vessel.mmsi ? 'whiteAlpha.100' : 'transparent'}
                _hover={{ bg: 'whiteAlpha.50' }}
              >
                <Table.Cell fontFamily="mono" fontSize="xs">
                  {vessel.mmsi}
                </Table.Cell>
                <Table.Cell>{vessel.name}</Table.Cell>
                <Table.Cell>{vessel.shipType}</Table.Cell>
                <Table.Cell>{vessel.sog.toFixed(1)} kn</Table.Cell>
                <Table.Cell>{vessel.cog}°</Table.Cell>
                <Table.Cell whiteSpace="nowrap">{formatTimeAgo(vessel.lastSeen, now)}</Table.Cell>
                <Table.Cell>
                  <Badge bg={STALENESS_COLOR[staleness]} color="black" fontSize="2xs">
                    {STALENESS_LABEL[staleness]}
                  </Badge>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
        {rows.length === 0 && (
          <Text textAlign="center" color="gray.500" fontSize="sm" py={6}>
            No contacts match the current filter.
          </Text>
        )}
      </Box>
    </Flex>
  )
}
