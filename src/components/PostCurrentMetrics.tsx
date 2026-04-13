import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  VStack,
  HStack,
  Text,
  Spinner,
  Badge,
  Button,
  StatRoot,
  StatLabel,
  StatValueText,
  SimpleGrid
} from '@chakra-ui/react';
import { postsAPI } from '../services/api';
import {
  MetricType,
  NetworkMetrics,
  NetworkCurrentMetrics,
  PostDetailedListItem,
  NetworkInfo
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
  clickThroughRate: { label: 'CTR', format: (v) => v ? `${(v * 100).toFixed(2)}%` : '0%' } };

const PostCurrentMetrics: React.FC<PostCurrentMetricsProps> = ({
  postId,
  post,
  networks
}) => {
  // const toast = useToast(); // Not available in Chakra v3

  // Color variables replaced with direct usage in Chakra UI v3

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
      // toast() // Not available in Chakra v3
    } finally {
      setLoading(false);
    }
  };

  const getNetworkName = (networkId: number) => {
    const network = networks.find(n => n.networkId === networkId);
    return network ? network.networkName : `Síť #${networkId}`;
  };

  // Commented out unused function
  // const getNetworkAvailableMetrics = (networkId: number): MetricType[] => {
  //   const networkMetrics = availableMetrics.find(m => m.networkId === networkId);
  //   return networkMetrics?.availableMetrics || [];
  // };


  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('cs-CZ');
  };

  // Pokud nejsou publikované sítě, zobrazit informaci
  if (publishedNetworks.length === 0) {
    return (
      <Box
        bg={{ base: "white", _dark: "gray.800" }}
        borderWidth="1px"
        borderColor={{ base: "gray.200", _dark: "gray.600" }}
        borderRadius="md"
        w="100%"
        overflow="hidden"
      >
        <Box p={{ base: 4, md: 6 }} borderBottom="1px" borderColor={{ base: "gray.200", _dark: "gray.600" }}>
          <Heading size={{ base: "md", md: "md" }} wordBreak="break-word">
            Aktuální statistiky
          </Heading>
        </Box>
        <Box p={{ base: 4, md: 6 }}>
          <Box
            p={3}
            bg={{ base: "blue.50", _dark: "blue.900" }}
            borderRadius="md"
            borderWidth="1px"
            borderColor={{ base: "blue.200", _dark: "blue.700" }}
          >
            <Text wordBreak="break-word" fontSize={{ base: "sm", md: "md" }}>
              Aktuální statistiky jsou dostupné pouze pro publikované příspěvky.
            </Text>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      bg={{ base: "white", _dark: "gray.800" }}
      borderWidth="1px"
      borderColor={{ base: "gray.200", _dark: "gray.600" }}
      borderRadius="md"
      w="100%"
      overflow="hidden"
    >
      <Box p={{ base: 4, md: 6 }} borderBottom="1px" borderColor={{ base: "gray.200", _dark: "gray.600" }}>
        <HStack justify="space-between" align="center" wrap="wrap" gap={2}>
          <Heading size={{ base: 'md', md: 'lg' }}>
            Aktuální metriky příspěvku
          </Heading>
          <Button
            size={{ base: 'sm', md: 'md' }}
            onClick={loadCurrentMetrics}
            loading={loading}
            loadingText="Obnovuji..."
          >
            Obnovit metriky
          </Button>
        </HStack>
      </Box>
      <Box p={{ base: 4, md: 6 }}>
        {loading ? (
          <Box textAlign="center" py={8}>
            <Spinner size="lg" mb={4} />
            <Text>Načítání metrik...</Text>
          </Box>
        ) : error ? (
          <Box
            p={3}
            bg={{ base: "red.50", _dark: "red.900" }}
            borderRadius="md"
            borderWidth="1px"
            borderColor={{ base: "red.200", _dark: "red.700" }}
          >
            <Text color={{ base: "red.800", _dark: "red.200" }} fontSize="sm">
              {error}
            </Text>
          </Box>
        ) : (
          <VStack gap={6} align="stretch">
            {currentMetrics.map((networkMetric) => {
              return (
                <Box key={networkMetric.networkId} w="100%" overflow="hidden">
                  <VStack gap={4} align="stretch">
                    {/* Network Header */}
                    <HStack justify="space-between" wrap="wrap" gap={2}>
                      <HStack gap={2}>
                        <Heading size="md" wordBreak="break-word">
                          {getNetworkName(networkMetric.networkId)}
                        </Heading>
                        <Badge colorPalette="blue" size="sm">
                          {networkMetric.networkType}
                        </Badge>
                      </HStack>
                      {networkMetric.data.timestamp && (
                        <Text fontSize="xs" color={{ base: "gray.600", _dark: "gray.400" }}>
                          Poslední aktualizace: {formatTimestamp(networkMetric.data.timestamp)}
                        </Text>
                      )}
                    </HStack>

                    {/* Engagement Metrics */}
                    <Box w="100%" overflow="hidden">
                      <Heading size="sm" mb={3}>
                        Engagement Metriky
                      </Heading>
                      <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap={4}>
                        {networkMetric.data.engagement &&
                          Object.entries(networkMetric.data.engagement).map(([metricType, value]) => {
                            const config = METRIC_CONFIG[metricType as MetricType];

                            // Zobrazit pouze metriky, které mají hodnotu nebo jsou k dispozici
                            if (value === undefined || value === null) return null;

                            return (
                              <StatRoot
                                key={metricType}
                                p={4}
                                borderRadius="md"
                                bg={{ base: "blue.50", _dark: "blue.900" }}
                                borderWidth="1px"
                                borderColor={{ base: "blue.200", _dark: "blue.700" }}
                              >
                                <StatLabel fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }}>
                                  {config?.label || metricType}
                                </StatLabel>
                                <StatValueText fontSize="2xl" fontWeight="bold">
                                  {config?.format(value) || value?.toString() || '0'}
                                </StatValueText>
                              </StatRoot>
                            );
                          })}
                      </SimpleGrid>
                    </Box>

                    {/* Reactions Metrics */}
                    {networkMetric.data.reactions && Object.keys(networkMetric.data.reactions).length > 0 && (
                      <Box mt={4} w="100%" overflow="hidden">
                        <Heading size="sm" mb={3}>
                          Reakce
                        </Heading>
                        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap={4}>
                          {Object.entries(networkMetric.data.reactions).map(([reaction, count]) => (
                            <StatRoot
                              key={reaction}
                              p={4}
                              borderRadius="md"
                              bg={{ base: "green.50", _dark: "green.900" }}
                              borderWidth="1px"
                              borderColor={{ base: "green.200", _dark: "green.700" }}
                            >
                              <StatLabel fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }}>
                                {reaction}
                              </StatLabel>
                              <StatValueText fontSize="2xl" fontWeight="bold">
                                {count?.toLocaleString() || '0'}
                              </StatValueText>
                            </StatRoot>
                          ))}
                        </SimpleGrid>
                      </Box>
                    )}

                    {/* Custom Metrics */}
                    {networkMetric.data.customMetrics && Object.keys(networkMetric.data.customMetrics).length > 0 && (
                      <Box mt={4} w="100%" overflow="hidden">
                        <Heading size="sm" mb={3}>
                          Další metriky
                        </Heading>
                        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap={4}>
                          {Object.entries(networkMetric.data.customMetrics).map(([metric, value]) => (
                            <StatRoot
                              key={metric}
                              p={4}
                              borderRadius="md"
                              bg={{ base: "purple.50", _dark: "purple.900" }}
                              borderWidth="1px"
                              borderColor={{ base: "purple.200", _dark: "purple.700" }}
                            >
                              <StatLabel fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }}>
                                {metric}
                              </StatLabel>
                              <StatValueText fontSize="2xl" fontWeight="bold">
                                {value?.toString() || '0'}
                              </StatValueText>
                            </StatRoot>
                          ))}
                        </SimpleGrid>
                      </Box>
                    )}
                  </VStack>
                </Box>
              );
            })}

            {currentMetrics.length === 0 && (
              <Box
                p={3}
                bg={{ base: "blue.50", _dark: "blue.900" }}
                borderRadius="md"
                borderWidth="1px"
                borderColor={{ base: "blue.200", _dark: "blue.700" }}
              >
                <Text fontSize="sm">
                  Pro tento příspěvek zatím nejsou k dispozici žádné metriky.
                </Text>
              </Box>
            )}
          </VStack>
        )}
      </Box>
    </Box>
  );
};

export default PostCurrentMetrics;
