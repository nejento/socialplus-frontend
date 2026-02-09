import { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  SimpleGrid,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  HStack,
  useDisclosure,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router';
import { AddIcon } from '@chakra-ui/icons';
import { networkAPI } from '../services/api';
import { OwnedNetwork, NetworkInfo } from '@/types';
import CreateNetworkModal from '../components/CreateNetworkModal';
import NetworkCard from '../components/NetworkCard';

const NetworksPage = () => {
  const navigate = useNavigate();
  const [ownedNetworks, setOwnedNetworks] = useState<OwnedNetwork[]>([]);
  const [allNetworks, setAllNetworks] = useState<NetworkInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    loadNetworks();
  }, []);

  const loadNetworks = async () => {
    try {
      setLoading(true);
      setError(null);

      // Paralelní načítání obou seznamů
      const [ownedRes, allRes] = await Promise.all([
        networkAPI.getOwnedNetworks(),
        networkAPI.getAllNetworks()
      ]);

      setOwnedNetworks(ownedRes.data);
      setAllNetworks(allRes.data);

      // Už nepotřebujeme načítat profily zvlášť, protože owner informace jsou součástí response
    } catch (error) {
      console.error('Chyba při načítání sítí:', error);
      setError('Nepodařilo se načíst seznam sociálních sítí');
    } finally {
      setLoading(false);
    }
  };

  const handleEditNetwork = (networkId: number) => {
    navigate(`/networks/edit/${networkId}`);
  };

  const handleCreateNetwork = () => {
    onOpen();
  };

  const handleNetworkCreated = (networkId: number) => {
    // Reload networks to show the new one
    loadNetworks();
    // Navigate to edit page for the new network
    navigate(`/networks/edit/${networkId}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Načítání sociálních sítí...</Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        <Box>
          <AlertTitle>Chyba při načítání!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Box>
      </Alert>
    );
  }

  // Výpočet administrovaných sítí (sítě s oprávněním, které nejsou moje)
  const administeredNetworks = allNetworks.filter(network =>
    !ownedNetworks.some(ownedNetwork => ownedNetwork.networkId === network.networkId)
  );

  const cardBg = useColorModeValue('white', 'gray.800');

  return (
    <Box
      minH="100vh"
      bg={useColorModeValue('gray.50', 'gray.900')}
      w="100%"
      maxW="100vw"
      overflow="hidden"
    >
      <Box
        maxW={{ base: "100%", lg: "1400px" }}
        mx="auto"
        w="100%"
      >
        <VStack spacing={6} align="stretch" w="100%" px={{ base: 0, md: 0 }}>
          {/* Header */}
          <Box bg={cardBg} p={{ base: 4, md: 6 }} borderRadius="lg" shadow="sm" w="100%" overflow="hidden">
            <VStack spacing={4} align="stretch" w="100%">
              <VStack
                spacing={3}
                align="stretch"
                w="100%"
                display={{ base: "flex", md: "none" }}
              >
                <Heading size="lg" wordBreak="break-word">
                  Správa sociálních sítí
                </Heading>
                <Button
                  leftIcon={<AddIcon />}
                  colorScheme="green"
                  onClick={handleCreateNetwork}
                  size="md"
                  w="100%"
                >
                  Vytvořit novou síť
                </Button>
              </VStack>

              <HStack
                justifyContent="space-between"
                align="center"
                w="100%"
                display={{ base: "none", md: "flex" }}
                flexWrap="wrap"
                gap={4}
              >
                <Heading size="xl" wordBreak="break-word">
                  Správa sociálních sítí
                </Heading>
                <Button
                  leftIcon={<AddIcon />}
                  colorScheme="green"
                  onClick={handleCreateNetwork}
                  size="lg"
                >
                  Vytvořit novou síť
                </Button>
              </HStack>
            </VStack>
          </Box>

          {/* Tabs */}
          <Box bg={cardBg} borderRadius="lg" shadow="sm" w="100%" overflow="hidden">
            <Tabs isFitted variant="enclosed" w="100%">
              <TabList
                overflowX="auto"
                overflowY="hidden"
                css={{
                  '&::-webkit-scrollbar': {
                    height: '4px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: useColorModeValue('#f1f1f1', '#2d3748'),
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: useColorModeValue('#c1c1c1', '#4a5568'),
                    borderRadius: '2px',
                  },
                }}
              >
                <Tab fontSize={{ base: "sm", md: "md" }} minW="fit-content" px={{ base: 2, md: 4 }}>
                  Moje sítě ({ownedNetworks.length})
                </Tab>
                <Tab fontSize={{ base: "sm", md: "md" }} minW="fit-content" px={{ base: 2, md: 4 }}>
                  Administrované sítě ({administeredNetworks.length})
                </Tab>
              </TabList>
              <TabPanels w="100%">
                {/* Tab 1: Moje sítě */}
                <TabPanel p={{ base: 4, md: 6 }} w="100%">
                  {ownedNetworks.length === 0 ? (
                    <Box
                      textAlign="center"
                      py={{ base: 8, md: 12 }}
                      borderWidth="1px"
                      borderRadius="lg"
                      borderStyle="dashed"
                      borderColor={useColorModeValue('gray.300', 'gray.600')}
                      w="100%"
                    >
                      <VStack spacing={4} px={{ base: 4, md: 0 }}>
                        <Text
                          fontSize={{ base: "md", md: "lg" }}
                          fontWeight="medium"
                          wordBreak="break-word"
                        >
                          Zatím nemáte žádné sociální sítě
                        </Text>
                        <Text
                          color={useColorModeValue('gray.600', 'gray.400')}
                          fontSize={{ base: "sm", md: "md" }}
                          wordBreak="break-word"
                        >
                          Vytvořte svou první sociální síť
                        </Text>
                        <Button
                          leftIcon={<AddIcon />}
                          colorScheme="green"
                          onClick={handleCreateNetwork}
                          size={{ base: "md", md: "lg" }}
                          w={{ base: "100%", md: "auto" }}
                          maxW={{ base: "300px", md: "none" }}
                        >
                          Vytvořit první síť
                        </Button>
                      </VStack>
                    </Box>
                  ) : (
                    <Box w="100%" overflow="hidden" py={2}>
                      <SimpleGrid
                        columns={{ base: 1, lg: 2, xl: 3 }}
                        spacing={{ base: 3, md: 4 }}
                        w="100%"
                      >
                        {ownedNetworks.map((network) => (
                          <Box key={network.networkId} w="100%" overflow="hidden">
                            <NetworkCard
                              network={network}
                              onEdit={handleEditNetwork}
                              isOwnNetwork={true}
                              showAdminBadge={false}
                            />
                          </Box>
                        ))}
                      </SimpleGrid>
                    </Box>
                  )}
                </TabPanel>

                {/* Tab 2: Administrované sítě */}
                <TabPanel p={{ base: 4, md: 6 }} w="100%">
                  {administeredNetworks.length === 0 ? (
                    <Box
                      textAlign="center"
                      py={{ base: 8, md: 12 }}
                      borderWidth="1px"
                      borderRadius="lg"
                      borderStyle="dashed"
                      borderColor={useColorModeValue('gray.300', 'gray.600')}
                      w="100%"
                    >
                      <VStack spacing={4} px={{ base: 4, md: 0 }}>
                        <Text
                          fontSize={{ base: "md", md: "lg" }}
                          fontWeight="medium"
                          wordBreak="break-word"
                        >
                          Nemáte přístup k žádným administrovaným sítím
                        </Text>
                        <Text
                          color={useColorModeValue('gray.600', 'gray.400')}
                          fontSize={{ base: "sm", md: "md" }}
                          wordBreak="break-word"
                        >
                          Zde se zobrazí sítě, ke kterým vám někdo udělil oprávnění
                        </Text>
                      </VStack>
                    </Box>
                  ) : (
                    <Box w="100%" overflow="hidden" py={2}>
                      <SimpleGrid
                        columns={{ base: 1, lg: 2, xl: 3 }}
                        spacing={{ base: 3, md: 4 }}
                        w="100%"
                      >
                        {administeredNetworks.map((network) => (
                          <Box key={network.networkId} w="100%" overflow="hidden">
                            <NetworkCard
                              network={network}
                              onEdit={handleEditNetwork}
                              isOwnNetwork={false}
                              showAdminBadge={true}
                            />
                          </Box>
                        ))}
                      </SimpleGrid>
                    </Box>
                  )}
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>

          {/* Create Network Modal */}
          <CreateNetworkModal
            isOpen={isOpen}
            onClose={onClose}
            onNetworkCreated={handleNetworkCreated}
          />
        </VStack>
      </Box>
    </Box>
  );
};

export default NetworksPage;
