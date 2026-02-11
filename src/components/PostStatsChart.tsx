import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  VStack,
  HStack,
  Text,
  Spinner,
  Button,
  SimpleGrid,
  CheckboxGroup,
  CheckboxRoot,
  CheckboxControl,
  CheckboxLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  SelectContent,
  SelectItem,
  createListCollection
} from '@chakra-ui/react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { postsAPI } from '../services/api';
import {
  NetworkInfo,
  PostDetailedListItem,
  MetricType,
  NetworkMetrics
} from '@/types';

interface PostStatsChartProps {
  postId: number;
  post: PostDetailedListItem;
  networks: NetworkInfo[];
}

// Mapování metrik na české názvy a barvy
const METRIC_CONFIG: Record<MetricType, { label: string; color: string }> = {
  likes: { label: 'Lajky', color: '#3182CE' },
  shares: { label: 'Sdílení', color: '#38A169' },
  comments: { label: 'Komentáře', color: '#D69E2E' },
  reposts: { label: 'Přeposlání', color: '#805AD5' },
  views: { label: 'Zobrazení', color: '#E53E3E' },
  reach: { label: 'Dosah', color: '#00B5D8' },
  impressions: { label: 'Imprese', color: '#DD6B20' },
  engagement: { label: 'Zapojení', color: '#319795' },
  clickThroughRate: { label: 'CTR', color: '#C53030' } };

const PostStatsChart: React.FC<PostStatsChartProps> = ({
  postId,
  post,
  networks
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<any>(null);
  const [selectedNetworkId, setSelectedNetworkId] = useState<number | null>(null);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['likes', 'shares', 'comments']);
  const [availableMetrics, setAvailableMetrics] = useState<NetworkMetrics[]>([]);

  // Získat sítě, které mají publikované příspěvky (actualPostDate a networkPostId)
  const getPublishedNetworks = () => {
    const publishedNetworkIds = post.scheduledTimes
      .filter(st => st.actualPostDate && st.networkPostId)
      .map(st => st.networkId);

    return networks.filter(network => publishedNetworkIds.includes(network.networkId));
  };

  const publishedNetworks = getPublishedNetworks();


  // Načtení dostupných metrik
  useEffect(() => {
    if (publishedNetworks.length > 0) {
      loadAvailableMetrics();
    }
  }, [postId, publishedNetworks.length]);

  // Automaticky vybrat první síť, pokud je k dispozici
  useEffect(() => {
    if (availableMetrics.length > 0 && !selectedNetworkId) {
      const firstNetwork = availableMetrics[0];
      setSelectedNetworkId(firstNetwork.networkId);
      // Automaticky vybrat všechny dostupné metriky
      setSelectedMetrics(firstNetwork.availableMetrics);
    }
  }, [availableMetrics, selectedNetworkId]);

  // Načtení dat grafu při změně výběru
  useEffect(() => {
    if (selectedNetworkId && selectedMetrics.length > 0) {
      loadGraphData();
    }
  }, [selectedNetworkId, selectedMetrics]);

  const loadAvailableMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await postsAPI.getAvailableMetrics(postId);
      const metrics = response.data.networks || [];

      // Filtrovat pouze sítě, které mají publikované příspěvky
      const publishedNetworkIds = publishedNetworks.map(n => n.networkId);
      const filteredMetrics = metrics.filter((metric: NetworkMetrics) =>
        publishedNetworkIds.includes(metric.networkId)
      );

      setAvailableMetrics(filteredMetrics);
    } catch (error) {
      console.error('Chyba při načítání dostupných metrik:', error);
      setError('Nepodařilo se načíst dostupné metriky');
      // toast() // Not available in Chakra v3
    } finally {
      setLoading(false);
    }
  };

  const loadGraphData = async (networkId?: number) => {
    const currentNetworkId = networkId || selectedNetworkId;
    if (!currentNetworkId || selectedMetrics.length === 0) return;

    try {
      setLoading(true);
      setError(null);

      const metricsQuery = selectedMetrics.join(',');

      const response = await postsAPI.getNetworkGraphData(postId, currentNetworkId, metricsQuery);

      if (response.data.networks && response.data.networks.length > 0) {
        const networkData = response.data.networks[0];
        setGraphData(networkData);
      } else {
        setGraphData(null);
        setError('Žádná data pro zobrazení');
      }
    } catch (error) {
      console.error('Chyba při načítání dat grafu:', error);
      setError('Nepodařilo se načíst data grafu');
      // toast() // Not available in Chakra v3
    } finally {
      setLoading(false);
    }
  };

  const handleMetricToggle = (metrics: string[]) => {
    setSelectedMetrics(metrics as MetricType[]);
  };

  const getCurrentNetworkMetrics = () => {
    return availableMetrics.find(m => m.networkId === selectedNetworkId);
  };

  const getNetworkName = (networkId: number) => {
    const network = networks.find(n => n.networkId === networkId);
    return network ? network.networkName : `Síť #${networkId}`;
  };

  const formatTooltipValue = (value: any, name: any) => {
    if (name === 'engagement' || name === 'clickThroughRate') {
      return `${(Number(value) * 100).toFixed(2)}%`;
    }
    return value?.toLocaleString() || '0';
  };

  const formatAxisLabel = (tickItem: any) => {
    const date = new Date(tickItem);
    return date.toLocaleDateString('cs-CZ', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMetricColor = (metric: string): string => {
    const config = METRIC_CONFIG[metric as MetricType];
    return config?.color || '#718096';
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
          <Heading size={{ base: 'md', md: 'lg' }}>
            Statistiky v čase
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
            <Text fontSize="sm">
              Statistiky v čase jsou dostupné pouze pro publikované příspěvky.
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
        <HStack justify="space-between" align="center" wrap="wrap" gap={4}>
          <Heading size={{ base: 'md', md: 'lg' }}>
            Statistiky v čase
          </Heading>
          <HStack gap={2}>
            <Button
              size={{ base: 'sm', md: 'md' }}
              onClick={loadAvailableMetrics}
              loading={loading}
              loadingText="Obnovuji..."
            >
              Obnovit data
            </Button>
          </HStack>
        </HStack>
      </Box>
      <Box p={{ base: 4, md: 6 }}>
        <VStack gap={6} align="stretch">
          {/* Network Selection */}
          {publishedNetworks.length > 1 && (
            <Box
              p={3}
              bg={{ base: "yellow.50", _dark: "yellow.900" }}
              borderRadius="md"
              borderWidth="1px"
              borderColor={{ base: "yellow.200", _dark: "yellow.700" }}
            >
              <Text fontSize="sm">
                Pro zobrazení statistik v čase vyberte jednu sociální síť.
              </Text>
            </Box>
          )}

          <Box w="100%">
            <Text fontSize="sm" fontWeight="medium" mb={2}>
              Vyberte sociální síť:
            </Text>
            <SelectRoot
              collection={createListCollection({
                items: publishedNetworks.map(n => ({
                  label: `${getNetworkName(n.networkId)} (${n.networkType})`,
                  value: n.networkId.toString()
                }))
              })}
              value={selectedNetworkId ? [selectedNetworkId.toString()] : []}
              onValueChange={({ value }) => {
                const networkId = value[0] ? parseInt(value[0]) : null;
                setSelectedNetworkId(networkId);
                if (networkId) {
                  loadGraphData(networkId);
                }
              }}
            >
              <SelectTrigger>
                <SelectValueText placeholder="Vyberte síť" />
              </SelectTrigger>
              <SelectContent>
                {publishedNetworks.map((network) => (
                  <SelectItem
                    key={network.networkId}
                    item={{
                      label: `${getNetworkName(network.networkId)} (${network.networkType})`,
                      value: network.networkId.toString()
                    }}
                  >
                    {getNetworkName(network.networkId)} ({network.networkType})
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          </Box>

          {/* Metric Selection */}
          {selectedNetworkId && (
            <Box w="100%">
              <Text fontSize="sm" fontWeight="medium" mb={2}>
                Vyberte metriky k zobrazení:
              </Text>
              <CheckboxGroup
                value={selectedMetrics}
                onValueChange={(e: any) => handleMetricToggle(e.value || e)}
              >
                <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} gap={3}>
                  {getCurrentNetworkMetrics()?.availableMetrics.map((metric) => {
                    const config = METRIC_CONFIG[metric];
                    return (
                      <CheckboxRoot key={metric} value={metric}>
                        <CheckboxControl />
                        <CheckboxLabel>
                          <Text fontSize="sm">{config?.label || metric}</Text>
                        </CheckboxLabel>
                      </CheckboxRoot>
                    );
                  })}
                </SimpleGrid>
              </CheckboxGroup>
            </Box>
          )}

          {/* Chart Display */}
          {loading ? (
            <Box textAlign="center" py={8}>
              <Spinner size="lg" mb={4} />
              <Text>Načítání statistik...</Text>
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
          ) : graphData && graphData.data && graphData.data.length > 0 ? (
            <Box w="100%" overflow="hidden">
              {/* Mobile chart */}
              <Box
                display={{ base: 'block', lg: 'none' }}
                w="100%"
                h="400px"
                overflowX="auto"
              >
                <Box minW="600px" h="100%">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={graphData.data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="timestamp"
                        tickFormatter={formatAxisLabel}
                      />
                      <YAxis />
                      <Tooltip
                        labelFormatter={(label) => new Date(label).toLocaleString('cs-CZ')}
                        formatter={formatTooltipValue}
                      />
                      <Legend />
                      {selectedMetrics.map((metric) => {
                        const config = METRIC_CONFIG[metric as MetricType];
                        return (
                          <Line
                            key={metric}
                            type="monotone"
                            dataKey={metric}
                            name={config?.label || metric}
                            stroke={getMetricColor(metric)}
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        );
                      })}
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Box>

              {/* Desktop chart */}
              <Box
                display={{ base: 'none', lg: 'block' }}
                w="100%"
                h="500px"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={graphData.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={formatAxisLabel}
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(label) => new Date(label).toLocaleString('cs-CZ')}
                      formatter={formatTooltipValue}
                    />
                    <Legend />
                    {selectedMetrics.map((metric) => {
                      const config = METRIC_CONFIG[metric as MetricType];
                      return (
                        <Line
                          key={metric}
                          type="monotone"
                          dataKey={metric}
                          name={config?.label || metric}
                          stroke={getMetricColor(metric)}
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      );
                    })}
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          ) : (
            <Box
              p={3}
              bg={{ base: "blue.50", _dark: "blue.900" }}
              borderRadius="md"
              borderWidth="1px"
              borderColor={{ base: "blue.200", _dark: "blue.700" }}
            >
              <Text fontSize="sm">
                Pro tuto síť zatím nejsou k dispozici žádná historická data.
              </Text>
            </Box>
          )}
        </VStack>
      </Box>
    </Box>
  );
};

export default PostStatsChart;
