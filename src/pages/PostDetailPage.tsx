import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Heading,
  Spinner,
  Badge,
  IconButton,
  Flex
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router';
import { MdDelete } from 'react-icons/md';
import { postsAPI, networkAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import DeletePostModal from '../components/DeletePostModal';
import PostStatsChart from '../components/PostStatsChart';
import PostCurrentMetrics from '../components/PostCurrentMetrics';
import PostContents from '../components/PostContents';
import PostAttachments from '../components/PostAttachments';
import { toaster } from '../components/ui/toaster';
import {
  NetworkInfo,
  User,
  PostDetailedListItem,
  NetworkMetrics
} from '@/types';

interface PostDetailData {
  post: PostDetailedListItem | null;
  creator: User | null;
  networks: NetworkInfo[];
}

const PostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [postData, setPostData] = useState<PostDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMonitorLoading, setIsMonitorLoading] = useState(false);
  const [availableMetrics, setAvailableMetrics] = useState<NetworkMetrics[]>([]);

  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);


  useEffect(() => {
    if (id) {
      loadPostDetail();
    }
  }, [id]);

  const loadPostDetail = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const postId = parseInt(id);

      // Načteme kompletní data příspěvku a sítě paralelně
      const [postResponse, networksResponse] = await Promise.all([
        postsAPI.getPost(postId),
        networkAPI.getAllNetworks()
      ]);

      const postData = postResponse.data;

      // Helper to get network styling based on type
      const getNetworkStyling = (networkType: string) => {
        const stylingMap: Record<string, { color: string }> = {
          facebook: { color: 'blue' },
          twitter: { color: 'blue' },
          mastodon: { color: 'purple' },
          bluesky: { color: 'blue' },
          threads: { color: 'gray' } };

        return stylingMap[networkType.toLowerCase()] || { color: 'gray' };
      };

      setPostData({
        post: postData || null,
        creator: postData?.creator || null,
        networks: (networksResponse.data || []).map((network: any) => {
          const styling = getNetworkStyling(network.networkType);
          return {
            id: network.networkId,
            name: network.networkName,
            displayName: network.networkName,
            isActive: true,
            color: styling.color,
            isOwned: true, // Assuming these are owned networks from getAllNetworks
            networkId: network.networkId,
            networkName: network.networkName,
            networkType: network.networkType,
            owner: network.owner,
            note: network.note,
            permission: network.permission
          } as NetworkInfo;
        })
      });

      // Načteme dostupné metriky pro publikované příspěvky
      if (postData && postData.scheduledTimes && postData.scheduledTimes.length > 0) {
        try {
          const metricsResponse = await postsAPI.getAvailableMetrics(postId);
          setAvailableMetrics(metricsResponse.data.networks || []);
        } catch (error) {
          console.error('Chyba při načítání dostupných metrik:', error);
          // Neblokujeme načítání stránky kvůli chybě metrik
        }
      }
    } catch (error) {
      console.error('Chyba při načítání detailu příspěvku:', error);
      setError('Nepodařilo se načíst detail příspěvku');
      toaster.create({
        title: 'Chyba při načítání',
        description: 'Nepodařilo se načíst detail příspěvku',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/posts/edit/${id}`);
  };

  const handleBack = () => {
    navigate('/posts');
  };

  const handleDeletePost = async () => {
    if (!id) return;

    try {
      const postId = parseInt(id);

      if (isNaN(postId)) {
        toaster.create({
          title: 'Chyba',
          description: 'Neplatné ID příspěvku',
          type: 'error'
        });
        return;
      }

      await postsAPI.deletePost(postId);
      toaster.create({
        title: 'Příspěvek smazán',
        description: 'Příspěvek byl úspěšně smazán',
        type: 'success'
      });
      navigate('/posts');
    } catch (error) {
      console.error('Chyba při mazání příspěvku:', error);
      toaster.create({
        title: 'Chyba při mazání',
        description: 'Nepodařilo se smazat příspěvek',
        type: 'error'
      });
    } finally {
      setDeleteModalOpen(false);
    }
  };

  const handleCollectMonitorData = async () => {
    if (!id) return;

    try {
      setIsMonitorLoading(true);
      const response = await postsAPI.collectMonitorData(parseInt(id));

      toaster.create({
        title: 'Data shromážděna',
        description: 'Data monitoringu byla úspěšně shromážděna',
        type: 'success'
      });

      console.log('Monitor data collected:', response.data);
    } catch (error) {
      console.error('Chyba při shromažďování dat monitoringu:', error);
      toaster.create({
        title: 'Chyba při shromažďování dat',
        description: 'Nepodařilo se shromáždit data monitoringu',
        type: 'error'
      });
    } finally {
      setIsMonitorLoading(false);
    }
  };


  // Helper pro kontrolu, zda může uživatel editovat příspěvek
  const canEditPost = (): boolean => {
    if (!postData?.post || !user) return false;

    // Pokud je uživatel creator příspěvku
    if (postData.creator && postData.creator.id === user.id) {
      return true;
    }

    // Pokud je uživatel v seznamu editorů
    return postData.post.editors && postData.post.editors.some(editor => editor.userId === user.id);


  };

  // Helper pro kontrolu, zda má příspěvek publikovaný obsah
  const hasPublishedContent = (): boolean => {
    return postData?.post?.scheduledTimes?.some(st => st.actualPostDate) || false;
  };

  if (loading) {
    return (
      <Box
        bg={{ base: "gray.50", _dark: "gray.900" }}
        minH="100vh"
        p={{ base: 4, md: 8 }}
        w="100%"
        maxW="100vw"
        overflow="hidden"
      >
        <Flex justify="center" align="center" minH="200px">
          <VStack gap={4}>
            <Spinner size="xl" />
            <Text>Načítání detailu příspěvku...</Text>
          </VStack>
        </Flex>
      </Box>
    );
  }

  if (error || !postData) {
    return (
      <Box
        bg={{ base: "gray.50", _dark: "gray.900" }}
        minH="100vh"
        p={{ base: 4, md: 8 }}
        w="100%"
        maxW="100vw"
        overflow="hidden"
      >
        <VStack gap={6} w="100%" maxW="100%">
          <VStack
            gap={3}
            align="stretch"
            w="100%"
            display={{ base: "flex", md: "none" }}
          >
            <Button
              onClick={handleBack}
              size="sm"
              w="100%"
            >
              Zpět na příspěvky
            </Button>
          </VStack>

          <HStack
            justifyContent="space-between"
            width="100%"
            display={{ base: "none", md: "flex" }}
          >
            <Button onClick={handleBack}>
              Zpět na příspěvky
            </Button>
          </HStack>

          <Box
            p={3}
            bg={{ base: "red.50", _dark: "red.900" }}
            borderRadius="md"
            borderWidth="1px"
            borderColor={{ base: "red.200", _dark: "red.700" }}
            w="100%"
          >
            <Text fontWeight="bold" color={{ base: "red.800", _dark: "red.200" }} mb={1}>
              Chyba
            </Text>
            <Text fontSize="sm" color={{ base: "red.700", _dark: "red.300" }} wordBreak="break-word">
              {error || 'Nepodařilo se načíst detail příspěvku'}
            </Text>
          </Box>
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
                <Button
                  onClick={handleBack}
                  size="md"
                  variant="outline"
                  w="100%"
                >
                  Zpět na příspěvky
                </Button>

                <VStack gap={2} w="100%">
                  {hasPublishedContent() && (
                    <Button
                      colorPalette="green"
                      onClick={handleCollectMonitorData}
                      loading={isMonitorLoading}
                      loadingText="Shromažďuji..."
                      size="md"
                      w="100%"
                    >
                      Shromáždit monitoring
                    </Button>
                  )}

                  <Button
                    colorPalette="blue"
                    onClick={handleEdit}
                    disabled={!canEditPost()}
                    size="md"
                    w="100%"
                  >
                    Upravit příspěvek
                  </Button>

                  <Button
                    colorPalette="red"
                    variant="outline"
                    onClick={() => setDeleteModalOpen(true)}
                    size="md"
                    w="100%"
                  >
                    Smazat příspěvek
                  </Button>
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
                    Detail příspěvku #{postData.post?.postId}
                  </Heading>
                  <Text
                    color={{ base: "gray.600", _dark: "gray.400" }}
                    fontSize="lg"
                    wordBreak="break-word"
                  >
                    Zobrazení detailních informací o příspěvku
                  </Text>
                </VStack>

                <HStack gap={3} flexWrap="wrap">
                  <Button onClick={handleBack} size="lg">
                    Zpět na příspěvky
                  </Button>
                  {hasPublishedContent() && (
                    <Button
                      colorPalette="green"
                      onClick={handleCollectMonitorData}
                      loading={isMonitorLoading}
                      loadingText="Shromažďuji..."
                      size="lg"
                    >
                      Shromáždit monitoring
                    </Button>
                  )}
                  {canEditPost() ? (
                    <Button
                      colorPalette="blue"
                      onClick={handleEdit}
                      size="lg"
                    >
                      Upravit příspěvek
                    </Button>
                  ) : (
                    <Button
                      colorPalette="blue"
                      onClick={handleEdit}
                      disabled
                      size="lg"
                    >
                      Upravit příspěvek
                    </Button>
                  )}
                  <IconButton
                    aria-label="Smazat příspěvek"
                    colorPalette="red"
                    variant="outline"
                    onClick={() => setDeleteModalOpen(true)}
                    size="lg"
                  >
                    <MdDelete />
                  </IconButton>
                </HStack>
              </HStack>
            </VStack>
          </Box>

          {/* Informace o příspěvku */}
          <Box w="100%" overflow="hidden" bg={{ base: "white", _dark: "gray.800" }} borderRadius="lg" shadow="sm">
            <Box p={{ base: 4, md: 6 }}>
              <VStack gap={4} align="stretch" w="100%">

                <VStack gap={2} align="start" w="100%">
                  <Heading
                    size={{ base: "md", md: "lg" }}
                    wordBreak="break-word"
                  >
                    Detail příspěvku #{postData.post?.postId}
                  </Heading>
                </VStack>

                <VStack gap={4} align="stretch" w="100%">
                  {/* Informace o autorovi */}
                  {postData.creator && (
                    <Box
                      p={{ base: 3, md: 4 }}
                      bg={{ base: "blue.50", _dark: "blue.900" }}
                      borderRadius="md"
                      w="100%"
                      overflow="hidden"
                    >
                      <VStack align="stretch" gap={2}>
                        <Text
                          fontWeight="bold"
                          fontSize={{ base: "sm", md: "md" }}
                          color={{ base: "gray.800", _dark: "white" }}
                        >
                          Autor příspěvku:
                        </Text>

                        <VStack
                          gap={2}
                          align="stretch"
                          display={{ base: "flex", md: "none" }}
                        >
                          <VStack align="start" gap={1}>
                            <Text
                              fontWeight="medium"
                              fontSize="sm"
                              wordBreak="break-word"
                            >
                              {postData.creator.displayname}
                            </Text>
                            <Text
                              fontSize="sm"
                              color={{ base: "gray.800", _dark: "white" }}
                              wordBreak="break-word"
                            >
                              @{postData.creator.username}
                            </Text>
                          </VStack>
                          <Badge colorPalette="purple" variant="outline" alignSelf="flex-start">
                            ID: {postData.creator.id}
                          </Badge>
                        </VStack>

                        <HStack
                          gap={3}
                          display={{ base: "none", md: "flex" }}
                          flexWrap="wrap"
                        >
                          <VStack align="start" gap={1}>
                            <Text fontWeight="medium" fontSize="sm">
                              {postData.creator.displayname}
                            </Text>
                            <Text fontSize="sm" color={{ base: "gray.800", _dark: "white" }}>
                              @{postData.creator.username}
                            </Text>
                          </VStack>
                          <Badge colorPalette="purple" variant="outline">
                            ID: {postData.creator.id}
                          </Badge>
                        </HStack>
                      </VStack>
                    </Box>
                  )}

                  {/* Informace o editorech */}
                  {postData.post?.editors && postData.post.editors.length > 0 && (
                    <Box
                      p={{ base: 3, md: 4 }}
                      bg={{ base: "green.50", _dark: "green.900" }}
                      borderRadius="md"
                      w="100%"
                      overflow="hidden"
                    >
                      <VStack align="stretch" gap={2}>
                        <Text
                          fontWeight="bold"
                          fontSize={{ base: "sm", md: "md" }}
                          color={{ base: "gray.800", _dark: "white" }}
                        >
                          Editoři příspěvku:
                        </Text>
                        <VStack gap={2} align="stretch">
                          {postData.post.editors.map((editor) => (
                            <VStack
                              key={editor.userId}
                              gap={2}
                              align="stretch"
                              display={{ base: "flex", md: "none" }}
                            >
                              <VStack align="start" gap={1}>
                                <Text
                                  fontWeight="medium"
                                  fontSize="sm"
                                  wordBreak="break-word"
                                >
                                  @{editor.username}
                                </Text>
                              </VStack>
                              <Badge
                                colorPalette="green"
                                variant="outline"
                                size="sm"
                                alignSelf="flex-start"
                              >
                                ID: {editor.userId}
                              </Badge>
                            </VStack>
                          ))}

                          {postData.post.editors.map((editor) => (
                            <HStack
                              key={`desktop-${editor.userId}`}
                              gap={3}
                              display={{ base: "none", md: "flex" }}
                              flexWrap="wrap"
                            >
                              <VStack align="start" gap={1}>
                                <Text fontWeight="medium" fontSize="sm">
                                  @{editor.username}
                                </Text>
                              </VStack>
                              <Badge colorPalette="green" variant="outline" size="sm">
                                ID: {editor.userId}
                              </Badge>
                            </HStack>
                          ))}
                        </VStack>
                      </VStack>
                    </Box>
                  )}
                </VStack>
              </VStack>
            </Box>
          </Box>

          {/* Obsah příspěvků */}
          {postData.post && (
            <Box w="100%" overflow="hidden">
              <PostContents
                post={postData.post}
                networks={postData.networks}
              />
            </Box>
          )}

          {/* Soubory */}
          {postData.post && (
            <Box w="100%" overflow="hidden">
              <PostAttachments
                postId={postData.post.postId}
                post={postData.post}
                networks={postData.networks}
              />
            </Box>
          )}

          {/* Aktuální statistiky výkonu */}
          {postData.post && postData.networks && availableMetrics.length > 0 && (
            <Box w="100%" overflow="hidden">
              <PostCurrentMetrics
                postId={postData.post.postId}
                post={postData.post}
                networks={postData.networks}
                availableMetrics={availableMetrics}
              />
            </Box>
          )}

          {/* Graf se statistikami výkonu */}
          {postData.post && postData.networks && (
            <Box w="100%" overflow="hidden">
              <PostStatsChart
                postId={postData.post.postId}
                post={postData.post}
                networks={postData.networks}
              />
            </Box>
          )}

          {/* Pokud nemá příspěvek žádný obsah */}
          {postData.post && postData.post.contents && postData.post.contents.length === 0 && postData.post.attachments && postData.post.attachments.length === 0 && (
            <Box
              p={3}
              bg={{ base: "blue.50", _dark: "blue.900" }}
              borderRadius="md"
              borderWidth="1px"
              borderColor={{ base: "blue.200", _dark: "blue.700" }}
              w="100%"
            >
              <Text fontSize="sm" color={{ base: "blue.800", _dark: "blue.200" }}>
                ℹ️ Tento příspěvek zatím neobsahuje žádný text ani přílohy.
              </Text>
            </Box>
          )}

          {/* Modal pro potvrzení smazání příspěvku */}
          <DeletePostModal
            open={isDeleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            onConfirm={handleDeletePost}
          />
        </VStack>
      </Box>
    </Box>
  );
};

export default PostDetailPage;
