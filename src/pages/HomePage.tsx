import React, { useState, useEffect } from 'react';
import {
  Box,
  SimpleGrid,
  Text,
  VStack,
  Heading,
  Button,
  Spinner,
  HStack,
  Tooltip
} from '@chakra-ui/react';
import { useNavigate } from 'react-router';
import { postsAPI, networkAPI, monitorAPI } from '../services/api';
import { PostDetailedListItem, PostDetailedListResponse, OwnedNetwork, MonitorStats } from '@/types';
import PostCard from '../components/PostCard';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  const [recentPosts, setRecentPosts] = useState<PostDetailedListItem[]>([]);
  const [networks, setNetworks] = useState<OwnedNetwork[]>([]);
  const [stats, setStats] = useState<MonitorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatingPost, setCreatingPost] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();


  useEffect(() => {
    loadRecentPosts();
    loadNetworks();
    loadStats();
  }, []);

  const loadRecentPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Používáme nový detailní endpoint pro získání posledních 3 příspěvků
      const response = await postsAPI.getPostsDetailed(1, 3);
      const data: PostDetailedListResponse = response.data;

      setRecentPosts(data.posts || []);
    } catch (error) {
      console.error('Chyba při načítání nejnovějších příspěvků:', error);
      setError('Nepodařilo se načíst nejnovější příspěvky');
      setRecentPosts([]);
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
    } catch (error) {
      console.error('Chyba při načítání sociálních sítí:', error);
      // Nebudeme zobrazovat chybu pro sítě na hlavní stránce
    }
  };

  const loadStats = async () => {
    try {
      // Načteme statistiky pomocí monitorAPI místo přímého fetch
      const response = await monitorAPI.getStats();
      const data: MonitorStats = response.data;
      setStats(data);
    } catch (error) {
      console.error('Chyba při načítání statistik:', error);
      // Nebudeme zobrazovat chybu pro statistiky na hlavní stránce
    }
  };

  // Vytvořit mapování networkId na názvy sítí
  const createNetworksMap = (): Map<number, string> => {
    const map = new Map<number, string>();
    networks.forEach(network => {
      map.set(network.networkId, network.networkName);
    });
    return map;
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

  const handleViewAllPosts = () => {
    navigate('/posts');
  };

  const handlePostDeleted = (postId: number) => {
    // Aktualizujeme seznam příspěvků odstraněním smazaného příspěvku
    setRecentPosts((prevPosts) => prevPosts.filter((post) => post.postId !== postId));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
        <VStack gap={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Načítání...</Text>
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
                  Vítejte v SocialPlus
                </Heading>
                <Text
                  fontSize="md"
                  color={{ base: "gray.600", _dark: "gray.300" }}
                  wordBreak="break-word"
                >
                  Spravujte své příspěvky pro sociální sítě na jednom místě
                </Text>
                <Button
                  colorPalette="blue"
                  onClick={handleCreateNew}
                  size="md"
                  loading={creatingPost}
                  loadingText="Vytváří se..."
                  w="100%"
                >
                  Vytvořit nový příspěvek
                </Button>
                <Button
                  variant="outline"
                  onClick={handleViewAllPosts}
                  size="md"
                  disabled={creatingPost}
                  w="100%"
                >
                  Zobrazit všechny příspěvky
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
                <VStack align="start" gap={2}>
                  <Heading size="xl" wordBreak="break-word">
                    Vítejte v SocialPlus
                  </Heading>
                  <Text
                    fontSize="lg"
                    color={{ base: "gray.600", _dark: "gray.300" }}
                    wordBreak="break-word"
                  >
                    Spravujte své příspěvky pro sociální sítě na jednom místě
                  </Text>
                </VStack>
                <HStack gap={3} flexWrap="wrap">
                  <Button
                    colorPalette="blue"
                    onClick={handleCreateNew}
                    size="lg"
                    loading={creatingPost}
                    loadingText="Vytváří se..."
                  >
                    Vytvořit nový příspěvek
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleViewAllPosts}
                    size="lg"
                    disabled={creatingPost}
                  >
                    Zobrazit všechny příspěvky
                  </Button>
                </HStack>
              </HStack>
            </VStack>
          </Box>

          {/* Recent Posts Section */}
          <Box
            bg={{ base: "white", _dark: "gray.800" }}
            p={{ base: 4, md: 6 }}
            borderRadius="lg"
            shadow="sm"
            w="100%"
            overflow="hidden"
          >
            <VStack gap={6} align="stretch" w="100%">
              <VStack
                gap={2}
                align="stretch"
                display={{ base: "flex", md: "none" }}
              >
                <Heading size="md">Nejnovější příspěvky</Heading>
                <Button
                  variant="ghost"
                  colorPalette="blue"
                  onClick={handleViewAllPosts}
                  size="sm"
                  alignSelf="flex-start"
                >
                  Zobrazit všechny →
                </Button>
              </VStack>

              <HStack
                justifyContent="space-between"
                align="center"
                display={{ base: "none", md: "flex" }}
                flexWrap="wrap"
              >
                <Heading size="lg">Nejnovější příspěvky</Heading>
                <Button
                  variant="ghost"
                  colorPalette="blue"
                  onClick={handleViewAllPosts}
                  size="sm"
                >
                  Zobrazit všechny →
                </Button>
              </HStack>

              {error && (
                <Box
                  p={3}
                  bg={{ base: "red.50", _dark: "red.900" }}
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor={{ base: "red.200", _dark: "red.700" }}
                >
                  <VStack align="start" gap={2}>
                    <Text fontWeight="bold" color={{ base: "red.800", _dark: "red.200" }}>
                      Chyba
                    </Text>
                    <Text fontSize="sm" color={{ base: "red.700", _dark: "red.300" }} wordBreak="break-word">
                      {error}
                    </Text>
                  </VStack>
                </Box>
              )}

              {!error && recentPosts.length === 0 ? (
                <Box
                  textAlign="center"
                  py={{ base: 6, md: 8 }}
                  borderWidth="1px"
                  borderRadius="lg"
                  borderStyle="dashed"
                  borderColor={{ base: "gray.300", _dark: "gray.600" }}
                  w="100%"
                >
                  <VStack gap={4} px={{ base: 4, md: 0 }}>
                    <Text
                      fontSize={{ base: "md", md: "lg" }}
                      fontWeight="medium"
                      wordBreak="break-word"
                    >
                      Zatím nemáte žádné příspěvky
                    </Text>
                    <Text
                      color={{ base: "gray.600", _dark: "gray.400" }}
                      fontSize={{ base: "sm", md: "md" }}
                      wordBreak="break-word"
                    >
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
                <Box w="100%" overflow="hidden">
                  <SimpleGrid
                    columns={{ base: 1, lg: 2, xl: 3 }}
                    gap={{ base: 3, md: 4 }}
                    w="100%"
                  >
                    {recentPosts.map((post) => (
                      <Box key={post.postId} w="100%" overflow="hidden">
                        <PostCard
                          post={post}
                          isContentLoading={false}
                          onPostDeleted={handlePostDeleted}
                          showDeleteModal={true}
                          currentUserId={user?.id}
                          networksMap={createNetworksMap()}
                        />
                      </Box>
                    ))}
                  </SimpleGrid>
                </Box>
              )}
            </VStack>
          </Box>

          {/* Quick Stats Section */}
          <Box w="100%" overflow="hidden">
            <SimpleGrid
              columns={{ base: 2, lg: 4 }}
              gap={{ base: 3, md: 6 }}
              w="100%"
            >
              <Tooltip.Root
                positioning={{ placement: "top" }}
              >
                <Tooltip.Trigger asChild>
                  <Box
                    bg={{ base: "white", _dark: "gray.800" }}
                    p={{ base: 3, md: 6 }}
                    borderRadius="lg"
                    shadow="sm"
                    textAlign="center"
                    cursor="help"
                    w="100%"
                    overflow="hidden"
                  >
                    <VStack gap={{ base: 1, md: 2 }}>
                      <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color="orange.500">
                        📝
                      </Text>
                      <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="orange.500">
                        {stats?.unplannedPosts ?? 0}
                      </Text>
                      <Text
                        color={{ base: "gray.600", _dark: "gray.400" }}
                        fontSize={{ base: "xs", md: "sm" }}
                        fontWeight="medium"
                        textAlign="center"
                        wordBreak="break-word"
                      >
                        Neplánované příspěvky
                      </Text>
                      <Text
                        color={{ base: "gray.500", _dark: "gray.500" }}
                        fontSize="xs"
                        mt={1}
                        textAlign="center"
                        wordBreak="break-word"
                      >
                        Rozepsané a nevydané
                      </Text>
                    </VStack>
                  </Box>
                </Tooltip.Trigger>
                <Tooltip.Positioner>
                  <Tooltip.Content fontSize="sm">
                    <Tooltip.Arrow />
                    Příspěvky bez naplánovaného obsahu. Zahrnuje rozepsané příspěvky vlastní i ty, kde jste editor.
                  </Tooltip.Content>
                </Tooltip.Positioner>
              </Tooltip.Root>

              <Tooltip.Root
                positioning={{ placement: "top" }}
              >
                <Tooltip.Trigger asChild>
                  <Box
                    bg={{ base: "white", _dark: "gray.800" }}
                    p={{ base: 3, md: 6 }}
                    borderRadius="lg"
                    shadow="sm"
                    textAlign="center"
                    cursor="help"
                    w="100%"
                    overflow="hidden"
                  >
                    <VStack gap={{ base: 1, md: 2 }}>
                      <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color="green.500">
                        📅
                      </Text>
                      <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="green.500">
                        {stats?.scheduledPosts ?? 0}
                      </Text>
                      <Text
                        color={{ base: "gray.600", _dark: "gray.400" }}
                        fontSize={{ base: "xs", md: "sm" }}
                        fontWeight="medium"
                        textAlign="center"
                        wordBreak="break-word"
                      >
                        Naplánované příspěvky
                      </Text>
                      <Text
                        color={{ base: "gray.500", _dark: "gray.500" }}
                        fontSize="xs"
                        mt={1}
                        textAlign="center"
                        wordBreak="break-word"
                      >
                        Čekají na odeslání
                      </Text>
                    </VStack>
                  </Box>
                </Tooltip.Trigger>
                <Tooltip.Positioner>
                  <Tooltip.Content fontSize="sm">
                    <Tooltip.Arrow />
                    Příspěvky s naplánovaným obsahem na sítě, které vlastníte nebo máte k nim write oprávnění.
                  </Tooltip.Content>
                </Tooltip.Positioner>
              </Tooltip.Root>

              <Tooltip.Root
                positioning={{ placement: "top" }}
              >
                <Tooltip.Trigger asChild>
                  <Box
                    bg={{ base: "white", _dark: "gray.800" }}
                    p={{ base: 3, md: 6 }}
                    borderRadius="lg"
                    shadow="sm"
                    textAlign="center"
                    cursor="help"
                    w="100%"
                    overflow="hidden"
                  >
                    <VStack gap={{ base: 1, md: 2 }}>
                      <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color="blue.500">
                        📊
                      </Text>
                      <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="blue.500">
                        {stats?.monitoredPosts ?? 0}
                      </Text>
                      <Text
                        color={{ base: "gray.600", _dark: "gray.400" }}
                        fontSize={{ base: "xs", md: "sm" }}
                        fontWeight="medium"
                        textAlign="center"
                        wordBreak="break-word"
                      >
                        Monitorované příspěvky
                      </Text>
                      <Text
                        color={{ base: "gray.500", _dark: "gray.500" }}
                        fontSize="xs"
                        mt={1}
                        textAlign="center"
                        wordBreak="break-word"
                      >
                        Sledování výkonu
                      </Text>
                    </VStack>
                  </Box>
                </Tooltip.Trigger>
                <Tooltip.Positioner>
                  <Tooltip.Content fontSize="sm">
                    <Tooltip.Arrow />
                    Publikované příspěvky maximálně 7 dní staré, které jsou monitorované pro sběr statistik.
                  </Tooltip.Content>
                </Tooltip.Positioner>
              </Tooltip.Root>

              <Tooltip.Root
                positioning={{ placement: "top" }}
              >
                <Tooltip.Trigger asChild>
                  <Box
                    bg={{ base: "white", _dark: "gray.800" }}
                    p={{ base: 3, md: 6 }}
                    borderRadius="lg"
                    shadow="sm"
                    textAlign="center"
                    cursor="help"
                    w="100%"
                    overflow="hidden"
                  >
                    <VStack gap={{ base: 1, md: 2 }}>
                      <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color="purple.500">
                        ⏰
                      </Text>
                      <Text
                        fontSize={{ base: "sm", md: "lg" }}
                        fontWeight="bold"
                        color="purple.500"
                        wordBreak="break-word"
                        textAlign="center"
                      >
                        {stats?.nextScheduledDate
                          ? new Date(stats.nextScheduledDate).toLocaleDateString('cs-CZ', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'Žádný'
                        }
                      </Text>
                      <Text
                        color={{ base: "gray.600", _dark: "gray.400" }}
                        fontSize={{ base: "xs", md: "sm" }}
                        fontWeight="medium"
                        textAlign="center"
                        wordBreak="break-word"
                      >
                        Další naplánovaný
                      </Text>
                      <Text
                        color={{ base: "gray.500", _dark: "gray.500" }}
                        fontSize="xs"
                        mt={1}
                        textAlign="center"
                        wordBreak="break-word"
                      >
                        {stats?.nextScheduledDate ? 'Datum a čas' : 'Žádný plán'}
                      </Text>
                    </VStack>
                  </Box>
                </Tooltip.Trigger>
                <Tooltip.Positioner>
                  <Tooltip.Content fontSize="sm">
                    <Tooltip.Arrow />
                    Nejbližší datum odeslání naplánovaného příspěvku. Zahrnuje sítě s read i write oprávnění.
                  </Tooltip.Content>
                </Tooltip.Positioner>
              </Tooltip.Root>
            </SimpleGrid>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
};

export default HomePage;
