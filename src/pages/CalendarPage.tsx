import React, { useMemo, useState } from 'react';
import {
  Box,
  Center,
  Grid,
  Heading,
  HStack,
  IconButton,
  Spinner,
  Text,
  VStack,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  SelectContent,
  SelectPositioner,
  SelectItem,
  createListCollection,
  Tooltip
} from '@chakra-ui/react';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { networkAPI, postsAPI } from '../services/api';
import { NetworkInfo, PostDetailedListItem } from '@/types';

interface CalendarEvent {
  postId: number;
  title: string;
  type: 'scheduled' | 'posted';
  date: Date;
  networkId: number;
  networkName: string;
}

const CalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedNetworkId, setSelectedNetworkId] = useState<number | null>(null);

  // Získání prvního a posledního dne měsíce pro API call
  const monthStart = useMemo(() => {
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    return start.toISOString();
  }, [currentDate]);

  const monthEnd = useMemo(() => {
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);
    return end.toISOString();
  }, [currentDate]);

  // Dotaz na dostupné sítě pro filtrování
  const { data: networksData } = useQuery({
    queryKey: ['all-networks'],
    queryFn: async () => {
      // Načteme vlastní sítě a sítě s oprávněními (stejně jako v PostsPage)
      const [ownedResponse, allResponse] = await Promise.all([
        networkAPI.getOwnedNetworks(),
        networkAPI.getAllNetworks()
      ]);

      const ownedNetworks = ownedResponse.data;
      const allNetworks = allResponse.data;

      // Spojíme sítě - vlastní mají prioritu
      return [
        ...ownedNetworks,
        ...allNetworks.filter((network: any) =>
          !ownedNetworks.some((owned: any) => owned.networkId === network.networkId)
        )
      ];
    }
  });

  const networksCollection = useMemo(() => {
    const items = networksData?.map((network: any) => ({
      label: network.networkName,
      value: network.networkId.toString()
    })) || [];
    return createListCollection({
      items: [
        { label: "Všechny sítě", value: "" },
        ...items
      ]
    });
  }, [networksData]);

  // Dotaz na filtrované příspěvky pro aktuální měsíc
  const { data: postsData, isLoading: loading } = useQuery({
    queryKey: ['calendar-posts', monthStart, monthEnd, selectedNetworkId],
    queryFn: () => postsAPI.getFilteredPosts({
      page: 1,
      limit: 200, // Načteme všechny příspěvky pro měsíc
      startDate: monthStart,
      endDate: monthEnd,
      ...(selectedNetworkId && { networkId: selectedNetworkId })
    }),
    select: (response) => response.data
  });

  // Převod příspěvků na kalendářní události
  const events = useMemo(() => {
    if (!postsData?.posts || !networksData) return [];

    // Vytvoření mapy networkId -> networkName
    const networkMap = new Map<number, string>();
    networksData.forEach((network: NetworkInfo) => {
      networkMap.set(network.networkId, network.networkName);
    });

    const calendarEvents: CalendarEvent[] = [];

    postsData.posts.forEach((post: PostDetailedListItem) => {
      post.scheduledTimes.forEach((scheduledTime) => {
        const networkName = networkMap.get(scheduledTime.networkId) || `Síť ${scheduledTime.networkId}`;

        // Pouze pokud má datum
        if (scheduledTime.postDate) {
          const eventDate = new Date(scheduledTime.postDate);

          // Naplánované příspěvky (bez actualPostDate)
          if (!scheduledTime.actualPostDate) {
            calendarEvents.push({
              postId: post.postId,
              title: post.contents[0]?.content || 'Prázdný příspěvek',
              type: 'scheduled',
              date: eventDate,
              networkId: scheduledTime.networkId,
              networkName: networkName
            });
          }
        }

        // Odeslané příspěvky (s actualPostDate)
        if (scheduledTime.actualPostDate) {
          const eventDate = new Date(scheduledTime.actualPostDate);
          const networkName = networkMap.get(scheduledTime.networkId) || `Síť ${scheduledTime.networkId}`;

          calendarEvents.push({
            postId: post.postId,
            title: post.contents[0]?.content || 'Prázdný příspěvek',
            type: 'posted',
            date: eventDate,
            networkId: scheduledTime.networkId,
            networkName: networkName
          });
        }
      });
    });

    return calendarEvents;
  }, [postsData, networksData]);

  // Navigace mezi měsíci
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Generování kalendářní mřížky
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startingDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // Pondělí = 0

    const daysInMonth = lastDayOfMonth.getDate();
    const days = [];

    // Předchozí měsíc (šedé dny)
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      days.push({
        date: new Date(year, month - 1, day),
        isCurrentMonth: false,
        dayNumber: day
      });
    }

    // Aktuální měsíc
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        date: new Date(year, month, day),
        isCurrentMonth: true,
        dayNumber: day
      });
    }

    // Další měsíc (šedé dny)
    const totalCells = 42; // 6 týdnů × 7 dní
    const remainingCells = totalCells - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false,
        dayNumber: day
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const today = new Date();

  const getEventsForDate = (date: Date) => {
    return events.filter(event =>
      event.date.toDateString() === date.toDateString()
    );
  };

  const monthNames = [
    'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
    'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'
  ];

  const dayNames = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];

  if (loading) {
    return (
      <Center h="400px">
        <Spinner size="lg" />
      </Center>
    );
  }

  return (
    <Box
      minH="100vh"
      bg={{ base: "gray.50", _dark: "gray.900" }}
      w="100%"
      maxW="100vw"
      overflow="hidden"
    >
      <Box
        maxW={{ base: "100%", lg: "1400px" }}
        mx="auto"
        w="100%"
      >
        <VStack gap={8} align="stretch" w="100%" px={{ base: 0, md: 0 }}>
          {/* Header */}
          <Box bg={{ base: "white", _dark: "gray.800" }} p={{ base: 4, md: 6 }} borderRadius="lg" shadow="sm" w="100%" overflow="hidden">
            <VStack gap={4} align="stretch" w="100%">
              <VStack
                gap={3}
                align="stretch"
                w="100%"
                display={{ base: "flex", md: "none" }}
              >
                <Heading size="lg" wordBreak="break-word">
                  Kalendář příspěvků
                </Heading>
                <Text
                  color={{ base: "gray.600", _dark: "gray.400" }}
                  fontSize="md"
                  wordBreak="break-word"
                >
                  Zobrazení naplánovaných a publikovaných příspěvků v kalendáři
                </Text>

                {/* Navigace - Mobile */}
                <HStack gap={2} w="100%" justify="center">
                  <IconButton
                    aria-label="Předchozí měsíc"
                    onClick={previousMonth}
                    variant="outline"
                    size="sm"
                  >
                    <MdChevronLeft />
                  </IconButton>
                  <Text
                    fontSize="md"
                    fontWeight="semibold"
                    minW="120px"
                    textAlign="center"
                    wordBreak="break-word"
                  >
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </Text>
                  <IconButton
                    aria-label="Následující měsíc"
                    onClick={nextMonth}
                    variant="outline"
                    size="sm"
                  >
                    <MdChevronRight />
                  </IconButton>
                </HStack>

                {/* Filtrování podle sítě - Mobile */}
                <VStack align="stretch" gap={2} w="100%">
                  <Text fontSize="sm" fontWeight="medium">
                    Filtr podle sítě
                  </Text>
                  <SelectRoot
                    collection={networksCollection}
                    value={selectedNetworkId ? [selectedNetworkId.toString()] : [""]}
                    onValueChange={({ value }) => {
                      const networkId = value[0] ? Number(value[0]) : null;
                      setSelectedNetworkId(networkId);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValueText placeholder="Všechny sítě" />
                    </SelectTrigger>
                    <SelectPositioner>
                      <SelectContent>
                        {networksCollection.items.map((item) => (
                          <SelectItem item={item} key={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </SelectPositioner>
                  </SelectRoot>
                </VStack>
              </VStack>

              <HStack
                justifyContent="space-between"
                align="center"
                w="100%"
                display={{ base: "none", md: "flex" }}
                flexWrap="wrap"
                gap={4}
              >
                <VStack align="start" gap={2}>
                  <Heading size="xl" wordBreak="break-word">
                    Kalendář příspěvků
                  </Heading>
                  <Text
                    color={{ base: "gray.600", _dark: "gray.400" }}
                    fontSize="lg"
                    wordBreak="break-word"
                  >
                    Zobrazení naplánovaných a publikovaných příspěvků v kalendáři
                  </Text>
                </VStack>

                <VStack align="end" gap={3}>
                  {/* Navigace - Desktop */}
                  <HStack gap={4}>
                    <IconButton
                      aria-label="Předchozí měsíc"
                      onClick={previousMonth}
                      variant="outline"
                      size="md"
                    >
                      <MdChevronLeft />
                    </IconButton>
                    <Text
                      fontSize="lg"
                      fontWeight="semibold"
                      minW="180px"
                      textAlign="center"
                    >
                      {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </Text>
                    <IconButton
                      aria-label="Následující měsíc"
                      onClick={nextMonth}
                      variant="outline"
                      size="md"
                    >
                      <MdChevronRight />
                    </IconButton>
                  </HStack>

                  {/* Filtrování podle sítě - Desktop */}
                  <VStack align="stretch" gap={2} maxW="300px" w="100%">
                    <Text fontSize="sm" fontWeight="medium">
                      Filtr podle sítě
                    </Text>
                    <SelectRoot
                      collection={networksCollection}
                      value={selectedNetworkId ? [selectedNetworkId.toString()] : [""]}
                      onValueChange={({ value }) => {
                        const networkId = value[0] ? Number(value[0]) : null;
                        setSelectedNetworkId(networkId);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValueText placeholder="Všechny sítě" />
                      </SelectTrigger>
                      <SelectPositioner>
                        <SelectContent>
                          {networksCollection.items.map((item) => (
                            <SelectItem item={item} key={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </SelectPositioner>
                    </SelectRoot>
                  </VStack>
                </VStack>
              </HStack>
            </VStack>
          </Box>

          {/* Calendar Grid */}
          <Box bg={{ base: "white", _dark: "gray.800" }} p={{ base: 4, md: 6 }} borderRadius="lg" shadow="sm" w="100%" overflow="hidden">
            {/* Kontejner s horizontálním scrollováním POUZE pro kalendář */}
            <Box
              overflowX="auto"
              overflowY="hidden"
              w="100%"
              css={{
                '&::-webkit-scrollbar': {
                  height: '8px'
                },
                '&::-webkit-scrollbar-track': {
                  background: { base: "#f1f1f1", _dark: "#2d3748" }
                },
                '&::-webkit-scrollbar-thumb': {
                  background: { base: "#c1c1c1", _dark: "#4a5568" },
                  borderRadius: '4px'
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: { base: "#a1a1a1", _dark: "#5a6578" }
                }
              }}
            >
              {/* Kalendářní obsah s minimální šířkou pro mobil */}
              <Box minW={{ base: "700px", md: "100%" }}>
                {/* Hlavička s dny v týdnu */}
                <Grid templateColumns="repeat(7, 1fr)" borderBottom="1px" borderColor={{ base: "gray.200", _dark: "gray.600" }} mb={0}>
                  {dayNames.map((day) => (
                    <Box
                      key={day}
                      p={{ base: 2, md: 3 }}
                      textAlign="center"
                      fontWeight="semibold"
                      fontSize={{ base: "xs", md: "sm" }}
                      minW="91px"
                    >
                      {day}
                    </Box>
                  ))}
                </Grid>

                {/* Kalendářní mřížka */}
                <Grid templateColumns="repeat(7, 1fr)">
                  {calendarDays.map((day, index) => {
                    const dayEvents = getEventsForDate(day.date);
                    const isToday = day.date.toDateString() === today.toDateString();

                    return (
                      <Box
                        key={index}
                        h={{ base: "100px", md: "120px" }}
                        borderRight="1px"
                        borderBottom="1px"
                        borderColor={{ base: "gray.200", _dark: "gray.600" }}
                        bg={isToday ? { base: "blue.50", _dark: "blue.900" } : 'transparent'}
                        opacity={day.isCurrentMonth ? 1 : 0.4}
                        p={{ base: 1, md: 2 }}
                        minW="91px"
                      >
                        <VStack gap={1} align="stretch" h="full">
                          <Text
                            fontSize={{ base: "xs", md: "sm" }}
                            fontWeight={isToday ? 'bold' : 'normal'}
                          >
                            {day.dayNumber}
                          </Text>

                          <VStack gap={1} align="stretch" flex={1} overflowY="auto">
                            {dayEvents.slice(0, 3).map((event, eventIndex) => (
                              <Tooltip.Root key={eventIndex}>
                                <Tooltip.Trigger asChild>
                                  <Box
                                    bg={event.type === 'scheduled' ? 'yellow.100' : 'green.100'}
                                    _dark={{ bg: event.type === 'scheduled' ? 'yellow.900' : 'green.900' }}
                                    p={1}
                                    borderRadius="sm"
                                    fontSize="xs"
                                    onClick={() => navigate(`/posts/${event.postId}`)}
                                    cursor="pointer"
                                    overflow="hidden"
                                    borderLeftWidth="3px"
                                    borderLeftColor={event.type === 'scheduled' ? 'yellow.500' : 'green.500'}
                                    _hover={{ opacity: 0.8 }}
                                  >
                                    <Text fontWeight="bold" truncate fontSize="10px">
                                      {event.title.substring(0, 20)}
                                    </Text>
                                    <Text fontSize="10px" color="gray.600" _dark={{ color: "gray.400" }} truncate>
                                      {event.networkName}
                                    </Text>
                                  </Box>
                                </Tooltip.Trigger>
                                <Tooltip.Positioner>
                                  <Tooltip.Content>
                                    {`${event.title} - ${event.networkName} (${event.type === 'scheduled' ? 'Naplánováno' : 'Odesláno'})`}
                                  </Tooltip.Content>
                                </Tooltip.Positioner>
                              </Tooltip.Root>
                            ))}
                            {dayEvents.length > 3 && (
                              <Text fontSize="xs" color="gray.500" textAlign="center">
                                +{dayEvents.length - 3} další
                              </Text>
                            )}
                          </VStack>
                        </VStack>
                      </Box>
                    );
                  })}
                </Grid>
              </Box>
            </Box>
          </Box>

          {/* Legenda pod kalendářem */}
          <HStack gap={4} fontSize="sm" justify="center" pb={4}>
            <HStack gap={2}>
              <Box w={3} h={3} bg="yellow.400" borderRadius="sm" />
              <Text>Naplánované</Text>
            </HStack>
            <HStack gap={2}>
              <Box w={3} h={3} bg="green.400" borderRadius="sm" />
              <Text>Odeslané</Text>
            </HStack>
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
};

export default CalendarPage;
