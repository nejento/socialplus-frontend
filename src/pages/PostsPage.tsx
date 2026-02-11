import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Heading,
  VStack,
  HStack,
  SimpleGrid,
  Text,
  Spinner,
  IconButton,
  Flex,
  TabsRoot,
  TabsList,
  TabsTrigger,
  TabsContent,
  chakra
} from '@chakra-ui/react';
import { useNavigate } from 'react-router';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
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

  // Stavy pro editované příspěvky - nyní používáme detailní data
  const [editorPosts, setEditorPosts] = useState<PostDetailedListItem[]>([]);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [editorCurrentPage, setEditorCurrentPage] = useState(1);
  const [editorTotalPages, setEditorTotalPages] = useState(1);
  const [editorTotalPosts, setEditorTotalPosts] = useState(0);
  const [editorPostsPerPage, setEditorPostsPerPage] = useState(12);

  const navigate = useNavigate();
  const { user } = useAuth();


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

  const renderNetworkPosts = () => {
    return (
      <>
        {/* Network selector */}
        {networks.length > 0 && (
          <Box mb={6}>
            <HStack gap={2} align="center">
              <Text fontSize="sm" fontWeight="medium">
                Vyberte síť:
              </Text>
              <chakra.select
                value={selectedNetworkId || ''}
                onChange={handleNetworkChange}
                width="auto"
                px={3}
                py={1}
                borderRadius="md"
                borderWidth="1px"
                bg={{ base: "white", _dark: "gray.700" }}
                borderColor={{ base: "gray.300", _dark: "gray.600" }}
                color={{ base: "black", _dark: "white" }}
              >
                {networks.map((network) => (
                  <option key={network.networkId} value={network.networkId}>
                    {network.networkName}
                  </option>
                ))}
              </chakra.select>
            </HStack>
          </Box>
        )}

        {/* Error Message */}
        {networkError && (
          <Box
            p={3}
            bg={{ base: "red.50", _dark: "red.900" }}
            borderRadius="md"
            borderWidth="1px"
            borderColor={{ base: "red.200", _dark: "red.700" }}
            mb={6}
          >
            <VStack align="start" gap={2}>
              <Text fontWeight="bold" color={{ base: "red.800", _dark: "red.200" }}>
                Chyba při načítání síťových příspěvků!
              </Text>
              <Text fontSize="sm" color={{ base: "red.700", _dark: "red.300" }}>
                {networkError}
              </Text>
            </VStack>
          </Box>
        )}

        {/* Loading State */}
        {networkLoading ? (
          <Box display="flex" justifyContent="center" py={12}>
            <VStack gap={4}>
              <Spinner size="lg" color="blue.500" />
              <Text fontSize={{ base: "sm", md: "md" }}>
                Načítání příspěvků ze sítě {getSelectedNetworkName()}...
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
            borderColor={{ base: "gray.300", _dark: "gray.600" }}
            w="100%"
          >
            <VStack gap={4} px={{ base: 4, md: 0 }}>
              <Text fontSize={{ base: "md", md: "lg" }} fontWeight="medium" wordBreak="break-word">
                {selectedNetworkId ? `Žádné příspěvky na síti ${getSelectedNetworkName()}` : 'Vyberte síť pro zobrazení příspěvků'}
              </Text>
            </VStack>
          </Box>
        ) : (
          <>
            <SimpleGrid columns={{ base: 1, lg: 2, xl: 3 }} gap={{ base: 3, md: 4 }}>
              {networkPosts.map((post) => (
                <PostCard
                  key={post.postId}
                  post={post}
                  onPostDeleted={handlePostDeleted}
                  showDeleteModal={false}
                  currentUserId={user?.id}
                  networksMap={createNetworksMap()}
                />
              ))}
            </SimpleGrid>

            {renderNetworkPagination()}
          </>
        )}
      </>
    );
  };

  const renderEditorPosts = () => {
    return (
      <>
        {/* Error Message */}
        {editorError && (
          <Box
            p={3}
            bg={{ base: "red.50", _dark: "red.900" }}
            borderRadius="md"
            borderWidth="1px"
            borderColor={{ base: "red.200", _dark: "red.700" }}
            mb={6}
          >
            <VStack align="start" gap={2}>
              <Text fontWeight="bold" color={{ base: "red.800", _dark: "red.200" }}>
                Chyba při načítání editovaných příspěvků!
              </Text>
              <Text fontSize="sm" color={{ base: "red.700", _dark: "red.300" }}>
                {editorError}
              </Text>
            </VStack>
          </Box>
        )}

        {/* Empty State */}
        {editorPosts.length === 0 && !editorError ? (
          <Box
            textAlign="center"
            py={{ base: 8, md: 12 }}
            borderWidth="1px"
            borderRadius="lg"
            borderStyle="dashed"
            borderColor={{ base: "gray.300", _dark: "gray.600" }}
            w="100%"
          >
            <VStack gap={4} px={{ base: 4, md: 0 }}>
              <Text fontSize={{ base: "md", md: "lg" }} fontWeight="medium" wordBreak="break-word">
                Žádné editované příspěvky
              </Text>
              <Text color={{ base: "gray.600", _dark: "gray.400" }} fontSize={{ base: "sm", md: "md" }} wordBreak="break-word">
                Zde se zobrazí příspěvky, které můžete editovat jako editor
              </Text>
            </VStack>
          </Box>
        ) : (
          <>
            <SimpleGrid columns={{ base: 1, lg: 2, xl: 3 }} gap={{ base: 3, md: 4 }}>
              {editorPosts.map((post) => (
                <PostCard
                  key={post.postId}
                  post={post}
                  onPostDeleted={handlePostDeleted}
                  showDeleteModal={false}
                  currentUserId={user?.id}
                  networksMap={createNetworksMap()}
                />
              ))}
            </SimpleGrid>

            {renderEditorPagination()}
          </>
        )}
      </>
    );
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
          <HStack gap={2}>
            <IconButton
              aria-label="Předchozí stránka"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              size="sm"
            >
              <MdChevronLeft />
            </IconButton>

            <HStack gap={2}>
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
                  colorPalette={currentPage === pageNum ? 'blue' : 'gray'}
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
            </HStack>

            <IconButton
              aria-label="Další stránka"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              size="sm"
            >
              <MdChevronRight />
            </IconButton>
          </HStack>
        )}

        {/* Selector pro počet příspěvků - zobrazit vždy pokud máme příspěvky */}
        {totalPosts > 0 && (
          <HStack gap={2} align="center">
            <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }}>
              Příspěvků na stránku:
            </Text>
            <chakra.select
              value={postsPerPage}
              onChange={handlePerPageChange}
              width="auto"
              px={3}
              py={1}
              borderRadius="md"
              borderWidth="1px"
              bg={{ base: "white", _dark: "gray.700" }}
              borderColor={{ base: "gray.300", _dark: "gray.600" }}
              color={{ base: "black", _dark: "white" }}
            >
              <option value={6}>6</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={50}>50</option>
            </chakra.select>
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
          <HStack gap={2}>
            <IconButton
              aria-label="Předchozí stránka"
              onClick={() => handleNetworkPageChange(networkCurrentPage - 1)}
              disabled={networkCurrentPage === 1}
              size="sm"
            >
              <MdChevronLeft />
            </IconButton>

            <HStack gap={2}>
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
                  colorPalette={networkCurrentPage === pageNum ? 'blue' : 'gray'}
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
            </HStack>

            <IconButton
              aria-label="Další stránka"
              onClick={() => handleNetworkPageChange(networkCurrentPage + 1)}
              disabled={networkCurrentPage === networkTotalPages}
              size="sm"
            >
              <MdChevronRight />
            </IconButton>
          </HStack>
        )}

        {networkTotalPosts > 0 && (
          <HStack gap={2} align="center">
            <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }}>
              Příspěvků na stránku:
            </Text>
            <chakra.select
              value={networkPostsPerPage}
              onChange={handleNetworkPerPageChange}
              width="auto"
              px={3}
              py={1}
              borderRadius="md"
              borderWidth="1px"
              bg={{ base: "white", _dark: "gray.700" }}
              borderColor={{ base: "gray.300", _dark: "gray.600" }}
              color={{ base: "black", _dark: "white" }}
            >
              <option value={6}>6</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={50}>50</option>
            </chakra.select>
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
          <HStack gap={2}>
            <IconButton
              aria-label="Předchozí stránka"
              onClick={() => handleEditorPageChange(editorCurrentPage - 1)}
              disabled={editorCurrentPage === 1}
              size="sm"
            >
              <MdChevronLeft />
            </IconButton>

            <HStack gap={2}>
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
                  colorPalette={editorCurrentPage === pageNum ? 'blue' : 'gray'}
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
            </HStack>

            <IconButton
              aria-label="Další stránka"
              onClick={() => handleEditorPageChange(editorCurrentPage + 1)}
              disabled={editorCurrentPage === editorTotalPages}
              size="sm"
            >
              <MdChevronRight />
            </IconButton>
          </HStack>
        )}

        {editorTotalPosts > 0 && (
          <HStack gap={2} align="center">
            <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }}>
              Příspěvků na stránku:
            </Text>
            <chakra.select
              value={editorPostsPerPage}
              onChange={handleEditorPerPageChange}
              width="auto"
              px={3}
              py={1}
              borderRadius="md"
              borderWidth="1px"
              bg={{ base: "white", _dark: "gray.700" }}
              borderColor={{ base: "gray.300", _dark: "gray.600" }}
              color={{ base: "black", _dark: "white" }}
            >
              <option value={6}>6</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={50}>50</option>
            </chakra.select>
          </HStack>
        )}
      </Flex>
    );
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
        <VStack gap={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Načítání příspěvků...</Text>
        </VStack>
      </Box>
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
        <VStack gap={6} align="stretch" w="100%" px={{ base: 0, md: 0 }}>
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
                  Správa příspěvků
                </Heading>
                <Button
                  colorPalette="blue"
                  onClick={handleCreateNew}
                  loading={creatingPost}
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
                  colorPalette="blue"
                  onClick={handleCreateNew}
                  loading={creatingPost}
                  loadingText="Vytváří se..."
                  size="lg"
                >
                  Vytvořit nový příspěvek
                </Button>
              </HStack>
            </VStack>
          </Box>

          {/* Tabs */}
          <Box bg={{ base: "white", _dark: "gray.800" }} borderRadius="lg" shadow="sm" w="100%" overflow="hidden">
            <TabsRoot defaultValue="my-posts">
              <TabsList
                overflowX="auto"
                overflowY="hidden"
                css={{
                  '&::-webkit-scrollbar': {
                    height: '4px'
                  },
                  '&::-webkit-scrollbar-track': {
                    background: { base: "#f1f1f1", _dark: "#2d3748" }
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: { base: "#c1c1c1", _dark: "#4a5568" },
                    borderRadius: '2px'
                  }
                }}
              >
                <TabsTrigger value="my-posts" fontSize={{ base: "sm", md: "md" }} minW="fit-content" px={{ base: 2, md: 4 }}>
                  Moje příspěvky
                </TabsTrigger>
                <TabsTrigger value="network-posts" fontSize={{ base: "sm", md: "md" }} minW="fit-content" px={{ base: 2, md: 4 }}>
                  Síťové příspěvky
                </TabsTrigger>
                <TabsTrigger value="editor-posts" fontSize={{ base: "sm", md: "md" }} minW="fit-content" px={{ base: 2, md: 4 }}>
                  Editované příspěvky
                </TabsTrigger>
              </TabsList>

              {/* Tab Content - Moje příspěvky */}
              <TabsContent value="my-posts" p={{ base: 4, md: 6 }}>
                {/* Error Message */}
                {error && (
                  <Box
                    p={3}
                    bg={{ base: "red.50", _dark: "red.900" }}
                    borderRadius="md"
                    borderWidth="1px"
                    borderColor={{ base: "red.200", _dark: "red.700" }}
                    mb={6}
                  >
                    <VStack align="start" gap={2}>
                      <Text fontWeight="bold" color={{ base: "red.800", _dark: "red.200" }}>
                        Chyba při načítání příspěvků!
                      </Text>
                      <Text fontSize="sm" color={{ base: "red.700", _dark: "red.300" }}>
                        {error}
                      </Text>
                    </VStack>
                  </Box>
                )}

                {/* Loading State */}
                {loading ? (
                  <Box display="flex" justifyContent="center" py={12}>
                    <VStack gap={4}>
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
                    borderColor={{ base: "gray.300", _dark: "gray.600" }}
                    w="100%"
                  >
                    <VStack gap={4} px={{ base: 4, md: 0 }}>
                      <Text fontSize={{ base: "md", md: "lg" }} fontWeight="medium" wordBreak="break-word">
                        Zatím nemáte žádné příspěvky
                      </Text>
                      <Text color={{ base: "gray.600", _dark: "gray.400" }} fontSize={{ base: "sm", md: "md" }} wordBreak="break-word">
                        Vytvořte svůj první příspěvek pro sociální sítě
                      </Text>
                      <Button
                        colorPalette="blue"
                        onClick={handleCreateNew}
                        loading={creatingPost}
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
                    <SimpleGrid columns={{ base: 1, lg: 2, xl: 3 }} gap={{ base: 3, md: 4 }}>
                      {posts.map((post) => (
                        <PostCard
                          key={post.postId}
                          post={post}
                          onPostDeleted={handlePostDeleted}
                          showDeleteModal={true}
                          currentUserId={user?.id}
                          networksMap={createNetworksMap()}
                        />
                      ))}
                    </SimpleGrid>

                    {renderPagination()}
                  </>
                )}
              </TabsContent>

              {/* Tab Content - Síťové příspěvky */}
              <TabsContent value="network-posts" p={{ base: 4, md: 6 }}>
                {renderNetworkPosts()}
              </TabsContent>

              {/* Tab Content - Editované příspěvky */}
              <TabsContent value="editor-posts" p={{ base: 4, md: 6 }}>
                {renderEditorPosts()}
              </TabsContent>
            </TabsRoot>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
};

export default PostsPage;
