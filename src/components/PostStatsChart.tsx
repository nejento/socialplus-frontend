import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardBody,
  Heading,
  VStack,
  Select,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  Checkbox,
  CheckboxGroup,
  Wrap,
  WrapItem,
  useColorModeValue,
  useToast,
  Button,
  HStack,
} from '@chakra-ui/react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { postsAPI } from '../services/api';
import {
  MetricType,
  NetworkMetrics,
  NetworkGraphData,
  PostDetailedListItem,
  NetworkInfo,
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
  clickThroughRate: { label: 'CTR', color: '#C53030' },
};

const PostStatsChart: React.FC<PostStatsChartProps> = ({ postId, post, networks }) => {
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const [availableMetrics, setAvailableMetrics] = useState<NetworkMetrics[]>([]);
  const [selectedNetworkId, setSelectedNetworkId] = useState<number | null>(null);
  const [selectedMetrics, setSelectedMetrics] = useState<MetricType[]>([]);
  const [graphData, setGraphData] = useState<NetworkGraphData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      toast({
        title: 'Chyba',
        description: 'Nepodařilo se načíst dostupné metriky',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadGraphData = async () => {
    if (!selectedNetworkId || selectedMetrics.length === 0) return;

    try {
      setLoading(true);
      setError(null);

      const metricsQuery = selectedMetrics.join(',');

      const response = await postsAPI.getNetworkGraphData(postId, selectedNetworkId, metricsQuery);

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
      toast({
        title: 'Chyba',
        description: 'Nepodařilo se načíst data grafu',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNetworkChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const networkId = parseInt(event.target.value);
    setSelectedNetworkId(networkId);

    // Najít dostupné metriky pro vybranou síť
    const networkMetrics = availableMetrics.find(m => m.networkId === networkId);
    if (networkMetrics) {
      // Automaticky vybrat všechny dostupné metriky
      setSelectedMetrics(networkMetrics.availableMetrics);
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

  const formatTooltipValue = (value: any, name: string) => {
    if (name === 'engagement' || name === 'clickThroughRate') {
      return `${(value * 100).toFixed(2)}%`;
    }
    return value?.toLocaleString() || '0';
  };

  const formatAxisLabel = (tickItem: any /*, index: number*/) => {
    const date = new Date(tickItem);
    return date.toLocaleDateString('cs-CZ', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
            Statistiky výkonu
          </Heading>
          <Button
            onClick={loadAvailableMetrics}
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
            Statistiky výkonu
          </Heading>
          <Button
            onClick={loadAvailableMetrics}
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
        <VStack spacing={6} align="stretch" w="100%">
          {/* Pokud nejsou publikované sítě */}
          {publishedNetworks.length === 0 ? (
            <Alert status="info">
              <AlertIcon />
              <Text wordBreak="break-word" fontSize={{ base: "sm", md: "md" }}>
                Tento příspěvek ještě nebyl publikován na žádné sociální síti.
                Statistiky budou dostupné po publikování.
              </Text>
            </Alert>
          ) : availableMetrics.length === 0 ? (
            <Alert status="warning">
              <AlertIcon />
              <Text wordBreak="break-word" fontSize={{ base: "sm", md: "md" }}>
                Pro tento příspěvek nejsou ještě dostupné žádné metriky.
                Zkuste použít tlačítko "Shromáždit monitoring" pro získání dat.
              </Text>
            </Alert>
          ) : (
            <>
              {/* Ovládací prvky */}
              <VStack spacing={4} align="stretch" w="100%">
                {/* Výběr sítě */}
                <Box w="100%">
                  <Text fontWeight="bold" mb={2} fontSize={{ base: "sm", md: "md" }}>
                    Sociální síť:
                  </Text>
                  <Select
                    value={selectedNetworkId || ''}
                    onChange={handleNetworkChange}
                    placeholder="Vyberte sociální síť"
                    size={{ base: "sm", md: "md" }}
                    w="100%"
                    bg={useColorModeValue('white', 'gray.800')}
                    borderColor={borderColor}
                    _hover={{
                      borderColor: useColorModeValue('gray.300', 'gray.500')
                    }}
                    _focus={{
                      borderColor: useColorModeValue('blue.500', 'blue.300'),
                      boxShadow: `0 0 0 1px ${useColorModeValue('#3182CE', '#63B3ED')}`
                    }}
                  >
                    {availableMetrics.map((networkMetric) => (
                      <option
                        key={networkMetric.networkId}
                        value={networkMetric.networkId}
                        style={{
                          backgroundColor: useColorModeValue('white', '#2D3748'),
                          color: useColorModeValue('black', 'white')
                        }}
                      >
                        {getNetworkName(networkMetric.networkId)} ({networkMetric.networkType})
                      </option>
                    ))}
                  </Select>
                </Box>

                {/* Výběr metrik */}
                {selectedNetworkId && (
                  <Box w="100%">
                    <Text fontWeight="bold" mb={2} fontSize={{ base: "sm", md: "md" }}>
                      Metriky:
                    </Text>
                    <CheckboxGroup
                      value={selectedMetrics}
                      onChange={handleMetricToggle}
                    >
                      <Wrap spacing={{ base: 2, md: 4 }}>
                        {getCurrentNetworkMetrics()?.availableMetrics.map((metric) => (
                          <WrapItem key={metric}>
                            <Checkbox value={metric} size={{ base: "sm", md: "md" }}>
                              <Text fontSize={{ base: "xs", md: "sm" }}>
                                {METRIC_CONFIG[metric]?.label || metric}
                              </Text>
                            </Checkbox>
                          </WrapItem>
                        ))}
                      </Wrap>
                    </CheckboxGroup>
                  </Box>
                )}
              </VStack>

              {/* Graf nebo chybové hlášení */}
              {loading ? (
                <Box textAlign="center" py={8}>
                  <Spinner size="lg" />
                  <Text mt={4} fontSize={{ base: "sm", md: "md" }}>
                    Načítání dat grafu...
                  </Text>
                </Box>
              ) : error ? (
                <Alert status="error">
                  <AlertIcon />
                  <Text wordBreak="break-word" fontSize={{ base: "sm", md: "md" }}>
                    {error}
                  </Text>
                </Alert>
              ) : graphData && graphData.data.length > 0 ? (
                <Box w="100%" overflow="hidden">
                  {/* Mobile scrollable chart container */}
                  <Box
                    display={{ base: "block", md: "none" }}
                    w="100%"
                    maxW="100vw"
                    position="relative"
                    overflowX="auto"
                    overflowY="hidden"
                    css={{
                      '&::-webkit-scrollbar': {
                        height: '8px',
                      },
                      '&::-webkit-scrollbar-track': {
                        background: useColorModeValue('#f1f1f1', '#2d3748'),
                        borderRadius: '4px',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: useColorModeValue('#c1c1c1', '#4a5568'),
                        borderRadius: '4px',
                      },
                      '&::-webkit-scrollbar-thumb:hover': {
                        background: useColorModeValue('#a8a8a8', '#2d3748'),
                      },
                    }}
                  >
                    <Box
                      height="350px"
                      minW={`${Math.max(graphData.data.length * 60, 320)}px`}
                      maxW="800px"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={graphData.data}
                          margin={{ left: 10, right: 20, top: 20, bottom: 60 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="timestamp"
                            tickFormatter={formatAxisLabel}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            fontSize={11}
                            interval={0}
                          />
                          <YAxis fontSize={11} width={50} />
                          <Tooltip
                            labelFormatter={(label) => new Date(label).toLocaleString('cs-CZ')}
                            formatter={formatTooltipValue}
                          />
                          <Legend wrapperStyle={{ fontSize: '12px' }} />
                          {selectedMetrics.map((metric) => (
                            <Line
                              key={metric}
                              type="monotone"
                              dataKey={metric}
                              stroke={METRIC_CONFIG[metric]?.color || '#8884d8'}
                              strokeWidth={2}
                              dot={{ r: 3 }}
                              name={METRIC_CONFIG[metric]?.label || metric}
                            />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  </Box>

                  {/* Desktop chart container */}
                  <Box
                    display={{ base: "none", md: "block" }}
                    height="400px"
                    width="100%"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={graphData.data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="timestamp"
                          tickFormatter={formatAxisLabel}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis />
                        <Tooltip
                          labelFormatter={(label) => new Date(label).toLocaleString('cs-CZ')}
                          formatter={formatTooltipValue}
                        />
                        <Legend />
                        {selectedMetrics.map((metric) => (
                          <Line
                            key={metric}
                            type="monotone"
                            dataKey={metric}
                            stroke={METRIC_CONFIG[metric]?.color || '#8884d8'}
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            name={METRIC_CONFIG[metric]?.label || metric}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </Box>
              ) : (
                <Alert status="info">
                  <AlertIcon />
                  <Text wordBreak="break-word" fontSize={{ base: "sm", md: "md" }}>
                    Žádná data k zobrazení. Zkuste vybrat jinou síť nebo metriky.
                  </Text>
                </Alert>
              )}
            </>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

export default PostStatsChart;
