import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Heading,
  VStack,
  HStack,
  SimpleGrid,
  Text,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  Select,
  IconButton,
  Badge,
  Flex,
  ButtonGroup,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router';
import { AddIcon, ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { postsAPI, networkAPI } from '../services/api';
import { OwnedNetwork, PostDetailedListItem, PostDetailedListResponse } from '@/types';
import PostCard from '../components/PostCard';
import { useAuth } from '../contexts/AuthContext';

const PostsPage: React.FC = () => {
  // Stavy pro uživatelské příspěvky - nyní používáme detailní data
  const [posts, setPosts] = useState<PostDetailedListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [postsPerPage, setPostsPerPage] = useState(12);
  const [creatingPost, setCreatingPost] = useState(false);

  // Stavy pro network příspěvky
  const [networks, setNetworks] = useState<OwnedNetwork[]>([]);
  const [selectedNetworkId, setSelectedNetworkId] = useState<number | null>(null);
  const [networkPosts, setNetworkPosts] = useState<PostDetailedListItem[]>([]);
  const [networkLoading, setNetworkLoading] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [networkCurrentPage, setNetworkCurrentPage] = useState(1);
  const [networkTotalPages, setNetworkTotalPages] = useState(1);
  const [networkTotalPosts, setNetworkTotalPosts] = useState(0);
  const [networkPostsPerPage, setNetworkPostsPerPage] = useState(12);
  const [networksLoading, setNetworksLoading] = useState(true);

  // Stavy pro editované příspěvky - nyní používáme detailní data
  const [editorPosts, setEditorPosts] = useState<PostDetailedListItem[]>([]);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [editorCurrentPage, setEditorCurrentPage] = useState(1);
  const [editorTotalPages, setEditorTotalPages] = useState(1);
  const [editorTotalPosts, setEditorTotalPosts] = useState(0);
  const [editorPostsPerPage, setEditorPostsPerPage] = useState(12);

  const navigate = useNavigate();
  const { user } = useAuth();

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    loadPosts();
  }, [currentPage, postsPerPage]);

  // Načtení dostupných sociálních sítí při načtení komponenty
  useEffect(() => {
    loadNetworks();
  }, []);

  // Načtení network posts při změně vybrané sítě nebo stránkování
  useEffect(() => {
    if (selectedNetworkId) {
      loadNetworkPosts();
    }
  }, [selectedNetworkId, networkCurrentPage, networkPostsPerPage]);

  // Načtení editovaných příspěvků při změně stránkování
  useEffect(() => {
    loadEditorPosts();
  }, [editorCurrentPage, editorPostsPerPage]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Používáme nový detailní endpoint, který vrací všechna data najednou
      const response = await postsAPI.getPostsDetailed(currentPage, postsPerPage);
      const data: PostDetailedListResponse = response.data;

      // Nastavíme příspěvky přímo - už máme všechna data včetně obsahu a příloh
      setPosts(data.posts || []);

      // Načítání paginačních dat
      if (data.pagination) {
        setTotalPosts(data.pagination.total);
        setTotalPages(data.pagination.totalPages);
      } else {
        // Fallback pokud API nevrátí pagination objekt
        setTotalPosts(data.posts?.length || 0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Chyba při načítání příspěvků:', error);
      setError('Nepodařilo se načíst příspěvky');
      setPosts([]);
      setTotalPosts(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const loadNetworks = async () => {
    try {
      setNetworksLoading(true);

      // Načteme vlastní sítě a sítě s oprávněními
      const [ownedResponse, allResponse] = await Promise.all([
        networkAPI.getOwnedNetworks(),
        networkAPI.getAllNetworks()
      ]);

      const ownedNetworks: OwnedNetwork[] = ownedResponse.data;
      const allNetworks: OwnedNetwork[] = allResponse.data;

      // Spojíme sítě - vlastní mají prioritu
      const combinedNetworks = [
        ...ownedNetworks,
        ...allNetworks.filter(network =>
          !ownedNetworks.some(owned => owned.networkId === network.networkId)
        )
      ];

      setNetworks(combinedNetworks);

      // Automaticky vybereme první síť pokud je k dispozici
      if (combinedNetworks.length > 0 && !selectedNetworkId) {
        setSelectedNetworkId(combinedNetworks[0].networkId);
      }
    } catch (error) {
      console.error('Chyba při načítání sociálních sítí:', error);
      setNetworkError('Nepodařilo se načíst sociální sítě');
    } finally {
      setNetworksLoading(false);
    }
  };

  const loadNetworkPosts = async () => {
    if (!selectedNetworkId) return;

    try {
      setNetworkLoading(true);
      setNetworkError(null);

      const response = await postsAPI.getNetworkPosts(
        selectedNetworkId,
        networkCurrentPage,
        networkPostsPerPage
      );
      const data: PostDetailedListResponse = response.data;

      setNetworkPosts(data.posts || []);

      if (data.pagination) {
        setNetworkTotalPosts(data.pagination.total);
        setNetworkTotalPages(data.pagination.totalPages);
      } else {
        setNetworkTotalPosts(data.posts?.length || 0);
        setNetworkTotalPages(1);
      }
    } catch (error) {
      console.error('Chyba při načítání network posts:', error);
      setNetworkError('Nepodařilo se načíst příspěvky ze sociální sítě');
      setNetworkPosts([]);
      setNetworkTotalPosts(0);
      setNetworkTotalPages(1);
    } finally {
      setNetworkLoading(false);
    }
  };

  const loadEditorPosts = async () => {
    try {
      setEditorError(null);

      // Používáme nový detailní endpoint pro editované příspěvky
      const response = await postsAPI.getEditorPostsDetailed(editorCurrentPage, editorPostsPerPage);
      const data: PostDetailedListResponse = response.data;

      // Nastavíme editované příspěvky přímo - už máme všechna data včetně oprávnění
      setEditorPosts(data.posts || []);

      // Načítání paginačních dat
      if (data.pagination) {
        setEditorTotalPosts(data.pagination.total);
        setEditorTotalPages(data.pagination.totalPages);
      } else {
        setEditorTotalPosts(data.posts?.length || 0);
        setEditorTotalPages(1);
      }
    } catch (error) {
      console.error('Chyba při načítání editovaných příspěvků:', error);
      setEditorError('Nepodařilo se načíst editované příspěvky');
      setEditorPosts([]);
      setEditorTotalPosts(0);
      setEditorTotalPages(1);
    }
  };

  const handleCreateNew = async () => {
    try {
      setCreatingPost(true);

      // Zavoláme endpoint pro vytvoření nového příspěvku
      const response = await postsAPI.createPost();
      const { postId } = response.data;

      // Přesměrujeme na editační stránku s novým postId
      navigate(`/posts/edit/${postId}`);
    } catch (error) {
      console.error('Chyba při vytváření nového příspěvku:', error);
      setError('Nepodařilo se vytvořit nový příspěvek');
    } finally {
      setCreatingPost(false);
    }
  };

  const handlePostDeleted = (postId: number) => {
    // Aktualizujeme seznam příspěvků a celkový počet
    setPosts(prev => prev.filter(post => post.postId !== postId));
    setTotalPosts(prev => prev - 1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handlePerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPerPage = parseInt(event.target.value);
    setPostsPerPage(newPerPage);
    setCurrentPage(1); // Reset na první stránku při změně počtu položek
  };

  // Handlers pro network posts
  const handleNetworkChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const networkId = parseInt(event.target.value);
    setSelectedNetworkId(networkId);
    setNetworkCurrentPage(1); // Reset na první stránku při změně sítě
  };

  const handleNetworkPageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= networkTotalPages) {
      setNetworkCurrentPage(newPage);
    }
  };

  const handleNetworkPerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPerPage = parseInt(event.target.value);
    setNetworkPostsPerPage(newPerPage);
    setNetworkCurrentPage(1); // Reset na první stránku při změně počtu položek
  };

  // Handlers pro editované příspěvky
  const handleEditorPageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= editorTotalPages) {
      setEditorCurrentPage(newPage);
    }
  };

  const handleEditorPerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPerPage = parseInt(event.target.value);
    setEditorPostsPerPage(newPerPage);
    setEditorCurrentPage(1); // Reset na první stránku při změně počtu položek
  };

  const getSelectedNetworkName = () => {
    const network = networks.find(n => n.networkId === selectedNetworkId);
    return network?.networkName || 'Neznámá síť';
  };

  const renderPagination = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Upravit startPage pokud endPage je na konci
    if (endPage === totalPages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <Flex justify="center" align="center" mt={8} wrap="wrap" gap={4}>
        {/* Zobrazit navigaci jen pokud máme více než 1 stránku */}
        {totalPages > 1 && (
          <HStack spacing={2}>
            <IconButton
              aria-label="Předchozí stránka"
              icon={<ChevronLeftIcon />}
              onClick={() => handlePageChange(currentPage - 1)}
              isDisabled={currentPage === 1}
              size="sm"
            />

            <ButtonGroup isAttached size="sm">
              {startPage > 1 && (
                <>
                  <Button onClick={() => handlePageChange(1)} variant="outline">
                    1
                  </Button>
                  {startPage > 2 && <Text mx={2}>...</Text>}
                </>
              )}

              {pageNumbers.map((pageNum) => (
                <Button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  colorScheme={currentPage === pageNum ? 'blue' : 'gray'}
                  variant={currentPage === pageNum ? 'solid' : 'outline'}
                >
                  {pageNum}
                </Button>
              ))}

              {endPage < totalPages && (
                <>
                  {endPage < totalPages - 1 && <Text mx={2}>...</Text>}
                  <Button onClick={() => handlePageChange(totalPages)} variant="outline">
                    {totalPages}
                  </Button>
                </>
              )}
            </ButtonGroup>

            <IconButton
              aria-label="Další stránka"
              icon={<ChevronRightIcon />}
              onClick={() => handlePageChange(currentPage + 1)}
              isDisabled={currentPage === totalPages}
              size="sm"
            />
          </HStack>
        )}

        {/* Selector pro počet příspěvků - zobrazit vždy pokud máme příspěvky */}
        {totalPosts > 0 && (
          <HStack spacing={2} align="center">
            <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
              Příspěvků na stránku:
            </Text>
            <Select
              value={postsPerPage}
              onChange={handlePerPageChange}
              size="sm"
              width="auto"
              bg={useColorModeValue('white', 'gray.700')}
              color={useColorModeValue('black', 'white')}
              _focus={{
                borderColor: useColorModeValue('blue.500', 'blue.300'),
                boxShadow: useColorModeValue('0 0 0 1px blue.500', '0 0 0 1px blue.300'),
              }}
            >
              <option value={6} style={{ backgroundColor: useColorModeValue('#ffffff', '#2D3748'), color: useColorModeValue('#000000', '#ffffff') }}>6</option>
              <option value={12} style={{ backgroundColor: useColorModeValue('#ffffff', '#2D3748'), color: useColorModeValue('#000000', '#ffffff') }}>12</option>
              <option value={24} style={{ backgroundColor: useColorModeValue('#ffffff', '#2D3748'), color: useColorModeValue('#000000', '#ffffff') }}>24</option>
              <option value={50} style={{ backgroundColor: useColorModeValue('#ffffff', '#2D3748'), color: useColorModeValue('#000000', '#ffffff') }}>50</option>
            </Select>
          </HStack>
        )}
      </Flex>
    );
  };

  const renderNetworkPagination = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, networkCurrentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(networkTotalPages, startPage + maxVisiblePages - 1);

    if (endPage === networkTotalPages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <Flex justify="center" align="center" mt={8} wrap="wrap" gap={4}>
        {networkTotalPages > 1 && (
          <HStack spacing={2}>
            <IconButton
              aria-label="Předchozí stránka"
              icon={<ChevronLeftIcon />}
              onClick={() => handleNetworkPageChange(networkCurrentPage - 1)}
              isDisabled={networkCurrentPage === 1}
              size="sm"
            />

            <ButtonGroup isAttached size="sm">
              {startPage > 1 && (
                <>
                  <Button onClick={() => handleNetworkPageChange(1)} variant="outline">
                    1
                  </Button>
                  {startPage > 2 && <Text mx={2}>...</Text>}
                </>
              )}

              {pageNumbers.map((pageNum) => (
                <Button
                  key={pageNum}
                  onClick={() => handleNetworkPageChange(pageNum)}
                  colorScheme={networkCurrentPage === pageNum ? 'blue' : 'gray'}
                  variant={networkCurrentPage === pageNum ? 'solid' : 'outline'}
                >
                  {pageNum}
                </Button>
              ))}

              {endPage < networkTotalPages && (
                <>
                  {endPage < networkTotalPages - 1 && <Text mx={2}>...</Text>}
                  <Button onClick={() => handleNetworkPageChange(networkTotalPages)} variant="outline">
                    {networkTotalPages}
                  </Button>
                </>
              )}
            </ButtonGroup>

            <IconButton
              aria-label="Další stránka"
              icon={<ChevronRightIcon />}
              onClick={() => handleNetworkPageChange(networkCurrentPage + 1)}
              isDisabled={networkCurrentPage === networkTotalPages}
              size="sm"
            />
          </HStack>
        )}

        {networkTotalPosts > 0 && (
          <HStack spacing={2} align="center">
            <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
              Příspěvků na stránku:
            </Text>
            <Select
              value={networkPostsPerPage}
              onChange={handleNetworkPerPageChange}
              size="sm"
              width="auto"
              bg={useColorModeValue('white', 'gray.700')}
              color={useColorModeValue('black', 'white')}
              _focus={{
                borderColor: useColorModeValue('blue.500', 'blue.300'),
                boxShadow: useColorModeValue('0 0 0 1px blue.500', '0 0 0 1px blue.300'),
              }}
            >
              <option value={6} style={{ backgroundColor: useColorModeValue('#ffffff', '#2D3748'), color: useColorModeValue('#000000', '#ffffff') }}>6</option>
              <option value={12} style={{ backgroundColor: useColorModeValue('#ffffff', '#2D3748'), color: useColorModeValue('#000000', '#ffffff') }}>12</option>
              <option value={24} style={{ backgroundColor: useColorModeValue('#ffffff', '#2D3748'), color: useColorModeValue('#000000', '#ffffff') }}>24</option>
              <option value={50} style={{ backgroundColor: useColorModeValue('#ffffff', '#2D3748'), color: useColorModeValue('#000000', '#ffffff') }}>50</option>
            </Select>
          </HStack>
        )}
      </Flex>
    );
  };

  const renderEditorPagination = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, editorCurrentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(editorTotalPages, startPage + maxVisiblePages - 1);

    if (endPage === editorTotalPages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <Flex justify="center" align="center" mt={8} wrap="wrap" gap={4}>
        {editorTotalPages > 1 && (
          <HStack spacing={2}>
            <IconButton
              aria-label="Předchozí stránka"
              icon={<ChevronLeftIcon />}
              onClick={() => handleEditorPageChange(editorCurrentPage - 1)}
              isDisabled={editorCurrentPage === 1}
              size="sm"
            />

            <ButtonGroup isAttached size="sm">
              {startPage > 1 && (
                <>
                  <Button onClick={() => handleEditorPageChange(1)} variant="outline">
                    1
                  </Button>
                  {startPage > 2 && <Text mx={2}>...</Text>}
                </>
              )}

              {pageNumbers.map((pageNum) => (
                <Button
                  key={pageNum}
                  onClick={() => handleEditorPageChange(pageNum)}
                  colorScheme={editorCurrentPage === pageNum ? 'blue' : 'gray'}
                  variant={editorCurrentPage === pageNum ? 'solid' : 'outline'}
                >
                  {pageNum}
                </Button>
              ))}

              {endPage < editorTotalPages && (
                <>
                  {endPage < editorTotalPages - 1 && <Text mx={2}>...</Text>}
                  <Button onClick={() => handleEditorPageChange(editorTotalPages)} variant="outline">
                    {editorTotalPages}
                  </Button>
                </>
              )}
            </ButtonGroup>

            <IconButton
              aria-label="Další stránka"
              icon={<ChevronRightIcon />}
              onClick={() => handleEditorPageChange(editorCurrentPage + 1)}
              isDisabled={editorCurrentPage === editorTotalPages}
              size="sm"
            />
          </HStack>
        )}

        {editorTotalPosts > 0 && (
          <HStack spacing={2} align="center">
            <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
              Příspěvků na stránku:
            </Text>
            <Select
              value={editorPostsPerPage}
              onChange={handleEditorPerPageChange}
              size="sm"
              width="auto"
              bg={useColorModeValue('white', 'gray.700')}
              color={useColorModeValue('black', 'white')}
              _focus={{
                borderColor: useColorModeValue('blue.500', 'blue.300'),
                boxShadow: useColorModeValue('0 0 0 1px blue.500', '0 0 0 1px blue.300'),
              }}
            >
              <option value={6} style={{ backgroundColor: useColorModeValue('#ffffff', '#2D3748'), color: useColorModeValue('#000000', '#ffffff') }}>6</option>
              <option value={12} style={{ backgroundColor: useColorModeValue('#ffffff', '#2D3748'), color: useColorModeValue('#000000', '#ffffff') }}>12</option>
              <option value={24} style={{ backgroundColor: useColorModeValue('#ffffff', '#2D3748'), color: useColorModeValue('#000000', '#ffffff') }}>24</option>
              <option value={50} style={{ backgroundColor: useColorModeValue('#ffffff', '#2D3748'), color: useColorModeValue('#000000', '#ffffff') }}>50</option>
            </Select>
          </HStack>
        )}
      </Flex>
    );
  };

  // Funkce pro získání oprávnění pro síťové příspěvky
  const getNetworkPostPermissions = (post: PostDetailedListItem) => {
    if (!user) {
      return { canEdit: false, canDelete: false };
    }

    // Pokud je uživatel tvůrce příspěvku, má plná oprávnění
    if (post.creator.id === user.id) {
      return { canEdit: true, canDelete: true };
    }

    // Pro přesná oprávnění bychom měli zavolat GET /post/{postId} endpoint
    // a zkontrolovat, zda je uživatel v seznamu editors
    // Prozatím vrátíme pouze základní oprávnění

    // Pokud má uživatel přístup k síti, může alespoň zobrazit detail
    const selectedNetwork = networks.find(n => n.networkId === selectedNetworkId);
    if (selectedNetwork) {
      // Je to vlastní síť?
      const isOwnedNetwork = !('permission' in selectedNetwork);

      if (isOwnedNetwork) {
        // Na vlastní síti může majitel editovat příspěvky (pokud je editor)
        // ale mazat pouze vlastní příspěvky
        return { canEdit: false, canDelete: false }; // Bez detailních info z API nemůžeme určit
      }

      if ('permission' in selectedNetwork && selectedNetwork.permission === 'write') {
        // S write oprávněním může editovat (pokud je editor), ale mazat pouze vlastní
        return { canEdit: false, canDelete: false }; // Bez detailních info z API nemůžeme určit
      }
    }

    // Pro všechny ostatní případy nemá oprávnění k editaci/mazání
    return { canEdit: false, canDelete: false };
  };

  // Vytvořit mapování networkId na názvy sítí
  const createNetworksMap = (): Map<number, string> => {
    const map = new Map<number, string>();
    networks.forEach(network => {
      map.set(network.networkId, network.networkName);
    });
    return map;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Načítání příspěvků...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box
      minH="100vh"
      bg={bgColor}
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
                  Správa příspěvků
                </Heading>
                <Button
                  leftIcon={creatingPost ? <Spinner size="sm" /> : <AddIcon />}
                  colorScheme="blue"
                  onClick={handleCreateNew}
                  isLoading={creatingPost}
                  loadingText="Vytváří se..."
                  size="md"
                  w="100%"
                >
                  Vytvořit nový příspěvek
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
                  Správa příspěvků
                </Heading>
                <Button
                  leftIcon={creatingPost ? <Spinner size="sm" /> : <AddIcon />}
                  colorScheme="blue"
                  onClick={handleCreateNew}
                  isLoading={creatingPost}
                  loadingText="Vytváří se..."
                  size="lg"
                >
                  Vytvořit nový příspěvek
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
                  Moje příspěvky
                </Tab>
                <Tab fontSize={{ base: "sm", md: "md" }} minW="fit-content" px={{ base: 2, md: 4 }}>
                  Síťové příspěvky
                </Tab>
                <Tab fontSize={{ base: "sm", md: "md" }} minW="fit-content" px={{ base: 2, md: 4 }}>
                  Editované příspěvky
                </Tab>
              </TabList>
              <TabPanels w="100%">
                {/* Tab 1: Moje příspěvky */}
                <TabPanel p={{ base: 4, md: 6 }} w="100%">
                  {/* Error Message */}
                  {error && (
                    <Alert status="error" borderRadius="md" mb={6}>
                      <AlertIcon />
                      <Box w="100%">
                        <Text fontWeight="bold" wordBreak="break-word" fontSize={{ base: "sm", md: "md" }}>
                          Chyba při načítání příspěvků!
                        </Text>
                        <Text wordBreak="break-word" fontSize={{ base: "sm", md: "md" }}>
                          {error}
                        </Text>
                      </Box>
                    </Alert>
                  )}

                  {/* Loading State */}
                  {loading ? (
                    <Box display="flex" justifyContent="center" py={12}>
                      <VStack spacing={4}>
                        <Spinner size="lg" color="blue.500" />
                        <Text fontSize={{ base: "sm", md: "md" }}>
                          Načítání příspěvků...
                        </Text>
                      </VStack>
                    </Box>
                  ) : posts.length === 0 && !error ? (
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
                          Zatím nemáte žádné příspěvky
                        </Text>
                        <Text
                          color={useColorModeValue('gray.600', 'gray.400')}
                          fontSize={{ base: "sm", md: "md" }}
                          wordBreak="break-word"
                        >
                          Vytvořte svůj první příspěvek pro sociální sítě
                        </Text>
                        <Button
                          leftIcon={creatingPost ? <Spinner size="sm" /> : <AddIcon />}
                          colorScheme="blue"
                          onClick={handleCreateNew}
                          isLoading={creatingPost}
                          loadingText="Vytváří se..."
                          size={{ base: "md", md: "lg" }}
                          w={{ base: "100%", md: "auto" }}
                          maxW={{ base: "300px", md: "none" }}
                        >
                          Vytvořit první příspěvek
                        </Button>
                      </VStack>
                    </Box>
                  ) : (
                    <>
                      <Box w="100%" overflow="hidden" py={2}>
                        <SimpleGrid
                          columns={{ base: 1, lg: 2, xl: 3 }}
                          spacing={{ base: 3, md: 4 }}
                          w="100%"
                        >
                          {posts.map((post) => (
                            <Box key={post.postId} w="100%" overflow="hidden">
                              <PostCard
                                post={post}
                                onPostDeleted={handlePostDeleted}
                                showDeleteModal={true}
                                currentUserId={user?.id}
                                networksMap={createNetworksMap()}
                              />
                            </Box>
                          ))}
                        </SimpleGrid>
                      </Box>

                      {/* Pagination */}
                      {renderPagination()}

                      {/* Page Info */}
                      <Text
                        textAlign="center"
                        fontSize={{ base: "xs", md: "sm" }}
                        color={useColorModeValue('gray.600', 'gray.400')}
                        mt={4}
                        wordBreak="break-word"
                      >
                        Stránka {currentPage} z {totalPages}
                        ({Math.min((currentPage - 1) * postsPerPage + 1, totalPosts)}-{Math.min(currentPage * postsPerPage, totalPosts)} z {totalPosts} příspěvků)
                      </Text>
                    </>
                  )}
                </TabPanel>

                {/* Tab 2: Síťové příspěvky */}
                <TabPanel p={{ base: 4, md: 6 }} w="100%">
                  {!networksLoading && (
                    <>
                      {networks.length > 0 && (
                        <Box mb={6} w="100%" overflow="hidden">
                          <VStack
                            spacing={3}
                            align="stretch"
                            w="100%"
                            display={{ base: "flex", md: "none" }}
                          >
                            <Text fontWeight="medium" fontSize="sm">
                              Sociální síť:
                            </Text>
                            <Select
                              value={selectedNetworkId || ''}
                              onChange={handleNetworkChange}
                              size="sm"
                              w="100%"
                              bg={useColorModeValue('white', 'gray.700')}
                              color={useColorModeValue('black', 'white')}
                              _focus={{
                                borderColor: useColorModeValue('blue.500', 'blue.300'),
                                boxShadow: useColorModeValue('0 0 0 1px blue.500', '0 0 0 1px blue.300'),
                              }}
                            >
                              {networks.map((network) => (
                                <option
                                  key={network.networkId}
                                  value={network.networkId}
                                  style={{
                                    backgroundColor: useColorModeValue('#ffffff', '#2D3748'),
                                    color: useColorModeValue('#000000', '#ffffff')
                                  }}
                                >
                                  {network.networkName}
                                  {'permission' in network && network.permission && (
                                    ` (${network.permission})`
                                  )}
                                </option>
                              ))}
                            </Select>
                            {selectedNetworkId && (
                              <Badge
                                colorScheme="blue"
                                variant="subtle"
                                alignSelf="flex-start"
                                wordBreak="break-word"
                              >
                                {getSelectedNetworkName()}
                              </Badge>
                            )}
                          </VStack>

                          <HStack
                            spacing={4}
                            align="center"
                            flexWrap="wrap"
                            w="100%"
                            display={{ base: "none", md: "flex" }}
                          >
                            <Text fontWeight="medium">Sociální síť:</Text>
                            <Select
                              value={selectedNetworkId || ''}
                              onChange={handleNetworkChange}
                              width="auto"
                              minW="200px"
                              bg={useColorModeValue('white', 'gray.700')}
                              color={useColorModeValue('black', 'white')}
                              _focus={{
                                borderColor: useColorModeValue('blue.500', 'blue.300'),
                                boxShadow: useColorModeValue('0 0 0 1px blue.500', '0 0 0 1px blue.300'),
                              }}
                            >
                              {networks.map((network) => (
                                <option
                                  key={network.networkId}
                                  value={network.networkId}
                                  style={{
                                    backgroundColor: useColorModeValue('#ffffff', '#2D3748'),
                                    color: useColorModeValue('#000000', '#ffffff')
                                  }}
                                >
                                  {network.networkName}
                                  {'permission' in network && network.permission && (
                                    ` (${network.permission})`
                                  )}
                                </option>
                              ))}
                            </Select>
                            {selectedNetworkId && (
                              <Badge colorScheme="blue" variant="subtle">
                                {getSelectedNetworkName()}
                              </Badge>
                            )}
                          </HStack>
                        </Box>
                      )}

                      {/* Error Message pro network příspěvky */}
                      {networkError && (
                        <Alert status="error" borderRadius="md" mb={6}>
                          <AlertIcon />
                          <Box w="100%">
                            <Text
                              fontWeight="bold"
                              wordBreak="break-word"
                              fontSize={{ base: "sm", md: "md" }}
                            >
                              Chyba při načítání příspěvků ze sítě!
                            </Text>
                            <Text
                              wordBreak="break-word"
                              fontSize={{ base: "sm", md: "md" }}
                            >
                              {networkError}
                            </Text>
                          </Box>
                        </Alert>
                      )}

                      {/* Network posts content */}
                      {networkLoading ? (
                        <Box display="flex" justifyContent="center" py={12}>
                          <VStack spacing={4}>
                            <Spinner size="lg" color="blue.500" />
                            <Text fontSize={{ base: "sm", md: "md" }}>
                              Načítání příspěvků ze sítě...
                            </Text>
                          </VStack>
                        </Box>
                      ) : networks.length === 0 ? (
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
                              Nemáte přístup k žádným sociálním sítím
                            </Text>
                            <Text
                              color={useColorModeValue('gray.600', 'gray.400')}
                              fontSize={{ base: "sm", md: "md" }}
                              wordBreak="break-word"
                            >
                              Vytvořte si vlastní sociální síť nebo požádejte o přístup
                            </Text>
                          </VStack>
                        </Box>
                      ) : networkPosts.length === 0 && !networkError ? (
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
                              Zatím žádné příspěvky
                            </Text>
                            <Text
                              color={useColorModeValue('gray.600', 'gray.400')}
                              fontSize={{ base: "sm", md: "md" }}
                              wordBreak="break-word"
                            >
                              V této sociální síti zatím nejsou žádné příspěvky
                            </Text>
                          </VStack>
                        </Box>
                      ) : (
                        <>
                          <Box w="100%" overflow="hidden" py={2}>
                            <SimpleGrid
                              columns={{ base: 1, lg: 2, xl: 3 }}
                              spacing={{ base: 4, md: 6 }}
                              w="100%"
                            >
                              {networkPosts.map((post) => (
                                <Box key={post.postId} w="100%" overflow="hidden" py={2}>
                                  <PostCard
                                    post={post}
                                    onPostDeleted={handlePostDeleted}
                                    showDeleteModal={true}
                                    permissions={getNetworkPostPermissions(post)}
                                    networkName={getSelectedNetworkName()}
                                    currentUserId={user?.id}
                                    networksMap={createNetworksMap()}
                                  />
                                </Box>
                              ))}
                            </SimpleGrid>
                          </Box>

                          {/* Pagination pro network příspěvky */}
                          {renderNetworkPagination()}

                          {/* Page Info pro network příspěvky */}
                          <Text
                            textAlign="center"
                            fontSize={{ base: "xs", md: "sm" }}
                            color={useColorModeValue('gray.600', 'gray.400')}
                            mt={4}
                            wordBreak="break-word"
                          >
                            Stránka {networkCurrentPage} z {networkTotalPages}
                            ({Math.min((networkCurrentPage - 1) * networkPostsPerPage + 1, networkTotalPosts)}-{Math.min(networkCurrentPage * networkPostsPerPage, networkTotalPosts)} z {networkTotalPosts} příspěvků)
                          </Text>
                        </>
                      )}
                    </>
                  )}
                </TabPanel>

                {/* Tab 3: Editované příspěvky */}
                <TabPanel p={{ base: 4, md: 6 }} w="100%">
                  {/* Error Message pro editované příspěvky */}
                  {editorError && (
                    <Alert status="error" borderRadius="md" mb={6}>
                      <AlertIcon />
                      <Box w="100%">
                        <Text
                          fontWeight="bold"
                          wordBreak="break-word"
                          fontSize={{ base: "sm", md: "md" }}
                        >
                          Chyba při načítání editovaných příspěvků!
                        </Text>
                        <Text
                          wordBreak="break-word"
                          fontSize={{ base: "sm", md: "md" }}
                        >
                          {editorError}
                        </Text>
                      </Box>
                    </Alert>
                  )}

                  {!editorError && editorPosts.length === 0 ? (
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
                          Zatím nemáte žádné editované příspěvky
                        </Text>
                        <Text
                          color={useColorModeValue('gray.600', 'gray.400')}
                          fontSize={{ base: "sm", md: "md" }}
                          wordBreak="break-word"
                        >
                          Vaše editované příspěvky se zobrazí zde
                        </Text>
                      </VStack>
                    </Box>
                  ) : (
                    <>
                      <Box w="100%" overflow="hidden" py={2}>
                        <SimpleGrid
                          columns={{ base: 1, lg: 2, xl: 3 }}
                          spacing={{ base: 4, md: 6 }}
                          w="100%"
                        >
                          {editorPosts.map((post) => (
                            <Box key={post.postId} w="100%" overflow="hidden" py={2}>
                              <PostCard
                                post={post}
                                onPostDeleted={handlePostDeleted}
                                showDeleteModal={true}
                                currentUserId={user?.id}
                                networksMap={createNetworksMap()}
                              />
                            </Box>
                          ))}
                        </SimpleGrid>
                      </Box>

                      {/* Pagination pro editované příspěvky */}
                      {renderEditorPagination()}

                      {/* Page Info pro editované příspěvky */}
                      <Text
                        textAlign="center"
                        fontSize={{ base: "xs", md: "sm" }}
                        color={useColorModeValue('gray.600', 'gray.400')}
                        mt={4}
                        wordBreak="break-word"
                      >
                        Stránka {editorCurrentPage} z {editorTotalPages}
                        ({Math.min((editorCurrentPage - 1) * editorPostsPerPage + 1, editorTotalPosts)}-{Math.min(editorCurrentPage * editorPostsPerPage, editorTotalPosts)} z {editorTotalPosts} příspěvků)
                      </Text>
                    </>
                  )}
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
};

export default PostsPage;
