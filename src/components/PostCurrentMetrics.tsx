import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardBody,
  Heading,
  VStack,
  HStack,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  Badge,
  Button,
  useColorModeValue,
  useToast,
  Stat,
  StatLabel,
  StatNumber,
  SimpleGrid,
} from '@chakra-ui/react';
import { postsAPI } from '../services/api';
import {
  MetricType,
  NetworkMetrics,
  NetworkCurrentMetrics,
  PostDetailedListItem,
  NetworkInfo,
} from '@/types';

interface PostCurrentMetricsProps {
  postId: number;
  post: PostDetailedListItem;
  networks: NetworkInfo[];
  availableMetrics: NetworkMetrics[];
}

// Mapování metrik na české názvy a formátování
const METRIC_CONFIG: Record<MetricType, { label: string; format: (value: any) => string }> = {
  likes: { label: 'Lajky', format: (v) => v?.toLocaleString() || '0' },
  shares: { label: 'Sdílení', format: (v) => v?.toLocaleString() || '0' },
  comments: { label: 'Komentáře', format: (v) => v?.toLocaleString() || '0' },
  reposts: { label: 'Přeposlání', format: (v) => v?.toLocaleString() || '0' },
  views: { label: 'Zobrazení', format: (v) => v?.toLocaleString() || '0' },
  reach: { label: 'Dosah', format: (v) => v?.toLocaleString() || '0' },
  impressions: { label: 'Imprese', format: (v) => v?.toLocaleString() || '0' },
  engagement: { label: 'Zapojení', format: (v) => v ? `${(v * 100).toFixed(2)}%` : '0%' },
  clickThroughRate: { label: 'CTR', format: (v) => v ? `${(v * 100).toFixed(2)}%` : '0%' },
};

const PostCurrentMetrics: React.FC<PostCurrentMetricsProps> = ({
  postId,
  post,
  networks,
  availableMetrics
}) => {
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const statBg = useColorModeValue('gray.50', 'gray.600');
  const reactionsBg = useColorModeValue('blue.50', 'blue.900');
  const customMetricsBg = useColorModeValue('green.50', 'green.900');

  const [currentMetrics, setCurrentMetrics] = useState<NetworkCurrentMetrics[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Získat sítě, které mají publikované příspěvky
  const getPublishedNetworks = () => {
    const publishedNetworkIds = post.scheduledTimes
      .filter(st => st.actualPostDate && st.networkPostId)
      .map(st => st.networkId);

    return networks.filter(network => publishedNetworkIds.includes(network.networkId));
  };

  const publishedNetworks = getPublishedNetworks();

  useEffect(() => {
    if (publishedNetworks.length > 0) {
      loadCurrentMetrics();
    }
  }, [postId, publishedNetworks.length]);

  const loadCurrentMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await postsAPI.getCurrentMetrics(postId);
      const metrics = response.data.networks || [];

      // Filtrovat pouze sítě, které mají publikované příspěvky
      const publishedNetworkIds = publishedNetworks.map(n => n.networkId);
      const filteredMetrics = metrics.filter((metric: NetworkCurrentMetrics) =>
        publishedNetworkIds.includes(metric.networkId)
      );

      setCurrentMetrics(filteredMetrics);
    } catch (error) {
      console.error('Chyba při načítání aktuálních metrik:', error);
      setError('Nepodařilo se načíst aktuální metriky');
      toast({
        title: 'Chyba',
        description: 'Nepodařilo se načíst aktuální metriky',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const getNetworkName = (networkId: number) => {
    const network = networks.find(n => n.networkId === networkId);
    return network ? network.networkName : `Síť #${networkId}`;
  };

  const getNetworkAvailableMetrics = (networkId: number): MetricType[] => {
    const networkMetrics = availableMetrics.find(m => m.networkId === networkId);
    return networkMetrics?.availableMetrics || [];
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('cs-CZ');
  };

  // Pokud nejsou publikované sítě, zobrazit informaci
  if (publishedNetworks.length === 0) {
    return (
      <Card bg={cardBg} borderColor={borderColor} w="100%" overflow="hidden">
        <CardHeader p={{ base: 4, md: 6 }}>
          <Heading size={{ base: "md", md: "md" }} wordBreak="break-word">
            Aktuální statistiky
          </Heading>
        </CardHeader>
        <CardBody p={{ base: 4, md: 6 }}>
          <Alert status="info">
            <AlertIcon />
            <Text wordBreak="break-word" fontSize={{ base: "sm", md: "md" }}>
              Aktuální statistiky jsou dostupné pouze pro publikované příspěvky.
            </Text>
          </Alert>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card bg={cardBg} borderColor={borderColor} w="100%" overflow="hidden">
      <CardHeader p={{ base: 4, md: 6 }}>
        <VStack
          spacing={3}
          align="stretch"
          w="100%"
          display={{ base: "flex", md: "none" }}
        >
          <Heading size="md" wordBreak="break-word">
            Aktuální statistiky
          </Heading>
          <Button
            onClick={loadCurrentMetrics}
            isLoading={loading}
            loadingText="Načítání..."
            size="sm"
            variant="outline"
            w="100%"
          >
            Obnovit
          </Button>
        </VStack>

        <HStack
          justifyContent="space-between"
          w="100%"
          display={{ base: "none", md: "flex" }}
          flexWrap="wrap"
          gap={4}
        >
          <Heading size="md" wordBreak="break-word">
            Aktuální statistiky
          </Heading>
          <Button
            onClick={loadCurrentMetrics}
            isLoading={loading}
            loadingText="Načítání..."
            size="sm"
            variant="outline"
          >
            Obnovit
          </Button>
        </HStack>
      </CardHeader>
      <CardBody p={{ base: 4, md: 6 }}>
        {loading ? (
          <Box textAlign="center" py={8}>
            <Spinner size="lg" />
            <Text mt={4} fontSize={{ base: "sm", md: "md" }}>
              Načítání aktuálních metrik...
            </Text>
          </Box>
        ) : error ? (
          <Alert status="error">
            <AlertIcon />
            <Text wordBreak="break-word" fontSize={{ base: "sm", md: "md" }}>
              {error}
            </Text>
          </Alert>
        ) : currentMetrics.length > 0 ? (
          <VStack spacing={6} align="stretch" w="100%">
            {currentMetrics.map((networkMetric) => {
              const availableMetricsForNetwork = getNetworkAvailableMetrics(networkMetric.networkId);

              return (
                <Box key={networkMetric.networkId} w="100%" overflow="hidden">
                  {/* Mobile network header */}
                  <VStack
                    spacing={2}
                    align="stretch"
                    mb={4}
                    display={{ base: "flex", md: "none" }}
                  >
                    <Badge
                      colorScheme="blue"
                      variant="subtle"
                      fontSize="sm"
                      px={3}
                      py={1}
                      alignSelf="flex-start"
                      wordBreak="break-word"
                    >
                      {getNetworkName(networkMetric.networkId)}
                    </Badge>
                    <Badge
                      colorScheme="gray"
                      variant="outline"
                      fontSize="xs"
                      alignSelf="flex-start"
                    >
                      {networkMetric.networkType}
                    </Badge>
                    <Text
                      fontSize="xs"
                      color={textColor}
                      wordBreak="break-word"
                    >
                      Aktualizováno: {formatTimestamp(networkMetric.data.timestamp)}
                    </Text>
                  </VStack>

                  {/* Desktop network header */}
                  <HStack
                    mb={4}
                    spacing={3}
                    display={{ base: "none", md: "flex" }}
                    flexWrap="wrap"
                    w="100%"
                  >
                    <Badge colorScheme="blue" variant="subtle" fontSize="sm" px={3} py={1}>
                      {getNetworkName(networkMetric.networkId)}
                    </Badge>
                    <Badge colorScheme="gray" variant="outline" fontSize="xs">
                      {networkMetric.networkType}
                    </Badge>
                    <Text fontSize="xs" color={textColor}>
                      Aktualizováno: {formatTimestamp(networkMetric.data.timestamp)}
                    </Text>
                  </HStack>

                  {/* Zobrazení metrik ve statistických boxech */}
                  <Box w="100%" overflow="hidden">
                    <SimpleGrid
                      columns={{ base: 1, sm: 2, md: 3, lg: 4, xl: 5 }}
                      spacing={{ base: 3, md: 4 }}
                      w="100%"
                    >
                      {availableMetricsForNetwork.map((metricType) => {
                        const value = networkMetric.data[metricType];
                        const config = METRIC_CONFIG[metricType];

                        // Zobrazit pouze metriky, které mají hodnotu nebo jsou k dispozici
                        if (value === undefined || value === null) return null;

                        return (
                          <Stat
                            key={metricType}
                            bg={statBg}
                            p={{ base: 3, md: 4 }}
                            borderRadius="md"
                            borderWidth="1px"
                            borderColor={borderColor}
                            w="100%"
                            overflow="hidden"
                          >
                            <StatLabel
                              fontSize={{ base: "xs", md: "xs" }}
                              color={textColor}
                              wordBreak="break-word"
                            >
                              {config?.label || metricType}
                            </StatLabel>
                            <StatNumber
                              fontSize={{ base: "md", md: "lg" }}
                              wordBreak="break-word"
                            >
                              {config?.format(value) || value?.toString() || '0'}
                            </StatNumber>
                          </Stat>
                        );
                      })}
                    </SimpleGrid>
                  </Box>

                  {/* Zobrazení reakcí, pokud existují */}
                  {networkMetric.data.reactions && Object.keys(networkMetric.data.reactions).length > 0 && (
                    <Box mt={4} w="100%" overflow="hidden">
                      <Text
                        fontWeight="bold"
                        fontSize={{ base: "sm", md: "sm" }}
                        mb={2}
                        wordBreak="break-word"
                      >
                        Reakce:
                      </Text>
                      <SimpleGrid
                        columns={{ base: 2, sm: 3, md: 4, lg: 6 }}
                        spacing={{ base: 2, md: 2 }}
                        w="100%"
                      >
                        {Object.entries(networkMetric.data.reactions).map(([reaction, count]) => (
                          <Stat
                            key={reaction}
                            size="sm"
                            bg={reactionsBg}
                            p={{ base: 2, md: 2 }}
                            borderRadius="md"
                            w="100%"
                            overflow="hidden"
                          >
                            <StatLabel
                              fontSize="xs"
                              wordBreak="break-word"
                            >
                              {reaction}
                            </StatLabel>
                            <StatNumber
                              fontSize={{ base: "sm", md: "sm" }}
                              wordBreak="break-word"
                            >
                              {count?.toLocaleString() || '0'}
                            </StatNumber>
                          </Stat>
                        ))}
                      </SimpleGrid>
                    </Box>
                  )}

                  {/* Zobrazení vlastních metrik, pokud existují */}
                  {networkMetric.data.customMetrics && Object.keys(networkMetric.data.customMetrics).length > 0 && (
                    <Box mt={4} w="100%" overflow="hidden">
                      <Text
                        fontWeight="bold"
                        fontSize={{ base: "sm", md: "sm" }}
                        mb={2}
                        wordBreak="break-word"
                      >
                        Vlastní metriky:
                      </Text>
                      <SimpleGrid
                        columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
                        spacing={{ base: 2, md: 2 }}
                        w="100%"
                      >
                        {Object.entries(networkMetric.data.customMetrics).map(([metric, value]) => (
                          <Stat
                            key={metric}
                            size="sm"
                            bg={customMetricsBg}
                            p={{ base: 2, md: 2 }}
                            borderRadius="md"
                            w="100%"
                            overflow="hidden"
                          >
                            <StatLabel
                              fontSize="xs"
                              wordBreak="break-word"
                            >
                              {metric}
                            </StatLabel>
                            <StatNumber
                              fontSize={{ base: "sm", md: "sm" }}
                              wordBreak="break-word"
                            >
                              {value?.toString() || '0'}
                            </StatNumber>
                          </Stat>
                        ))}
                      </SimpleGrid>
                    </Box>
                  )}
                </Box>
              );
            })}
          </VStack>
        ) : (
          <Alert status="info">
            <AlertIcon />
            <Text wordBreak="break-word" fontSize={{ base: "sm", md: "md" }}>
              Žádné aktuální statistiky k zobrazení.
            </Text>
          </Alert>
        )}
      </CardBody>
    </Card>
  );
};

export default PostCurrentMetrics;
