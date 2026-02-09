import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  useColorModeValue,
  Heading,
  Spinner,
  Alert,
  AlertIcon,
  Badge,
  Card,
  CardHeader,
  IconButton,
  useToast,
  Flex,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router';
import { EditIcon, ArrowBackIcon, DeleteIcon, ViewIcon } from '@chakra-ui/icons';
import { postsAPI, networkAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import DeletePostModal from '../components/DeletePostModal';
import PostStatsChart from '../components/PostStatsChart';
import PostCurrentMetrics from '../components/PostCurrentMetrics';
import PostContents from '../components/PostContents';
import PostAttachments from '../components/PostAttachments';
import {
  NetworkInfo,
  User,
  PostDetailedListItem,
  NetworkMetrics,
} from '@/types';

interface PostDetailData {
  post: PostDetailedListItem | null;
  creator: User | null;
  networks: NetworkInfo[];
}

const PostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const [postData, setPostData] = useState<PostDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMonitorLoading, setIsMonitorLoading] = useState(false);
  const [availableMetrics, setAvailableMetrics] = useState<NetworkMetrics[]>([]);

  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.600', 'gray.300');

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
          threads: { color: 'gray' },
        };

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
      toast({
        title: 'Chyba',
        description: 'Nepodařilo se načíst detail příspěvku',
        status: 'error',
        duration: 5000,
        isClosable: true,
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
        toast({
          title: 'Chyba',
          description: 'Neplatné ID příspěvku',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      await postsAPI.deletePost(postId);
      toast({
        title: 'Úspěch',
        description: 'Příspěvek byl úspěšně smazán',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/posts');
    } catch (error) {
      console.error('Chyba při mazání příspěvku:', error);
      toast({
        title: 'Chyba',
        description: 'Nepodařilo se smazat příspěvek',
        status: 'error',
        duration: 3000,
        isClosable: true,
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

      toast({
        title: 'Úspěch',
        description: 'Data monitoringu byla úspěšně shromážděna',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      console.log('Monitor data collected:', response.data);
    } catch (error) {
      console.error('Chyba při shromažďování dat monitoringu:', error);
      toast({
        title: 'Chyba',
        description: 'Nepodařilo se shromáždit data monitoringu',
        status: 'error',
        duration: 3000,
        isClosable: true,
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
        bg={bgColor}
        minH="100vh"
        p={{ base: 4, md: 8 }}
        w="100%"
        maxW="100vw"
        overflow="hidden"
      >
        <Flex justify="center" align="center" minH="200px">
          <VStack spacing={4}>
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
        bg={bgColor}
        minH="100vh"
        p={{ base: 4, md: 8 }}
        w="100%"
        maxW="100vw"
        overflow="hidden"
      >
        <VStack spacing={6} w="100%" maxW="100%">
          <VStack
            spacing={3}
            align="stretch"
            w="100%"
            display={{ base: "flex", md: "none" }}
          >
            <Button
              leftIcon={<ArrowBackIcon />}
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
            <Button leftIcon={<ArrowBackIcon />} onClick={handleBack}>
              Zpět na příspěvky
            </Button>
          </HStack>

          <Alert status="error" w="100%">
            <AlertIcon />
            <Text wordBreak="break-word" fontSize={{ base: "sm", md: "md" }}>
              {error || 'Nepodařilo se načíst detail příspěvku'}
            </Text>
          </Alert>
        </VStack>
      </Box>
    );
  }

  return (
    <Box
      bg={bgColor}
      minH="100vh"
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
          <Box bg={useColorModeValue('white', 'gray.800')} p={{ base: 4, md: 6 }} borderRadius="lg" shadow="sm" w="100%" overflow="hidden">
            <VStack spacing={4} align="stretch" w="100%">
              <VStack
                spacing={3}
                align="stretch"
                w="100%"
                display={{ base: "flex", md: "none" }}
              >
                <Button
                  leftIcon={<ArrowBackIcon />}
                  onClick={handleBack}
                  size="md"
                  variant="outline"
                  w="100%"
                >
                  Zpět na příspěvky
                </Button>

                <VStack spacing={2} w="100%">
                  {hasPublishedContent() && (
                    <Button
                      leftIcon={<ViewIcon />}
                      colorScheme="green"
                      onClick={handleCollectMonitorData}
                      isLoading={isMonitorLoading}
                      loadingText="Shromažďuji..."
                      size="md"
                      w="100%"
                    >
                      Shromáždit monitoring
                    </Button>
                  )}

                  <Button
                    leftIcon={<EditIcon />}
                    colorScheme="blue"
                    onClick={handleEdit}
                    isDisabled={!canEditPost()}
                    size="md"
                    w="100%"
                  >
                    Upravit příspěvek
                  </Button>

                  <Button
                    leftIcon={<DeleteIcon />}
                    colorScheme="red"
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
                <VStack align="start" spacing={2}>
                  <Heading size="xl" wordBreak="break-word">
                    Detail příspěvku #{postData.post?.postId}
                  </Heading>
                  <Text
                    color={useColorModeValue('gray.600', 'gray.400')}
                    fontSize="lg"
                    wordBreak="break-word"
                  >
                    Zobrazení detailních informací o příspěvku
                  </Text>
                </VStack>

                <HStack spacing={3} flexWrap="wrap">
                  <Button leftIcon={<ArrowBackIcon />} onClick={handleBack} size="lg">
                    Zpět na příspěvky
                  </Button>
                  {hasPublishedContent() && (
                    <Button
                      leftIcon={<ViewIcon />}
                      colorScheme="green"
                      onClick={handleCollectMonitorData}
                      isLoading={isMonitorLoading}
                      loadingText="Shromažďuji..."
                      size="lg"
                    >
                      Shromáždit monitoring
                    </Button>
                  )}
                  {canEditPost() ? (
                    <Button
                      leftIcon={<EditIcon />}
                      colorScheme="blue"
                      onClick={handleEdit}
                      size="lg"
                    >
                      Upravit příspěvek
                    </Button>
                  ) : (
                    <Button
                      leftIcon={<EditIcon />}
                      colorScheme="blue"
                      onClick={handleEdit}
                      isDisabled
                      size="lg"
                    >
                      Upravit příspěvek
                    </Button>
                  )}
                  <IconButton
                    aria-label="Smazat příspěvek"
                    icon={<DeleteIcon />}
                    colorScheme="red"
                    variant="outline"
                    onClick={() => setDeleteModalOpen(true)}
                    size="lg"
                  />
                </HStack>
              </HStack>
            </VStack>
          </Box>

          {/* Informace o příspěvku */}
          <Card w="100%" overflow="hidden">
            <CardHeader p={{ base: 4, md: 6 }}>
              <VStack spacing={4} align="stretch" w="100%">

                <VStack spacing={2} align="start" w="100%">
                  <Heading
                    size={{ base: "md", md: "lg" }}
                    wordBreak="break-word"
                  >
                    Detail příspěvku #{postData.post?.postId}
                  </Heading>
                </VStack>

                <VStack spacing={4} align="stretch" w="100%">
                  {/* Informace o autorovi */}
                  {postData.creator && (
                    <Box
                      p={{ base: 3, md: 4 }}
                      bg={useColorModeValue('blue.50', 'blue.900')}
                      borderRadius="md"
                      w="100%"
                      overflow="hidden"
                    >
                      <VStack align="stretch" spacing={2}>
                        <Text
                          fontWeight="bold"
                          fontSize={{ base: "sm", md: "md" }}
                          color={textColor}
                        >
                          Autor příspěvku:
                        </Text>

                        <VStack
                          spacing={2}
                          align="stretch"
                          display={{ base: "flex", md: "none" }}
                        >
                          <VStack align="start" spacing={1}>
                            <Text
                              fontWeight="medium"
                              fontSize="sm"
                              wordBreak="break-word"
                            >
                              {postData.creator.displayname}
                            </Text>
                            <Text
                              fontSize="sm"
                              color={textColor}
                              wordBreak="break-word"
                            >
                              @{postData.creator.username}
                            </Text>
                          </VStack>
                          <Badge colorScheme="purple" variant="outline" alignSelf="flex-start">
                            ID: {postData.creator.id}
                          </Badge>
                        </VStack>

                        <HStack
                          spacing={3}
                          display={{ base: "none", md: "flex" }}
                          flexWrap="wrap"
                        >
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="medium" fontSize="sm">
                              {postData.creator.displayname}
                            </Text>
                            <Text fontSize="sm" color={textColor}>
                              @{postData.creator.username}
                            </Text>
                          </VStack>
                          <Badge colorScheme="purple" variant="outline">
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
                      bg={useColorModeValue('green.50', 'green.900')}
                      borderRadius="md"
                      w="100%"
                      overflow="hidden"
                    >
                      <VStack align="stretch" spacing={2}>
                        <Text
                          fontWeight="bold"
                          fontSize={{ base: "sm", md: "md" }}
                          color={textColor}
                        >
                          Editoři příspěvku:
                        </Text>
                        <VStack spacing={2} align="stretch">
                          {postData.post.editors.map((editor) => (
                            <VStack
                              key={editor.userId}
                              spacing={2}
                              align="stretch"
                              display={{ base: "flex", md: "none" }}
                            >
                              <VStack align="start" spacing={1}>
                                <Text
                                  fontWeight="medium"
                                  fontSize="sm"
                                  wordBreak="break-word"
                                >
                                  @{editor.username}
                                </Text>
                              </VStack>
                              <Badge
                                colorScheme="green"
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
                              spacing={3}
                              display={{ base: "none", md: "flex" }}
                              flexWrap="wrap"
                            >
                              <VStack align="start" spacing={1}>
                                <Text fontWeight="medium" fontSize="sm">
                                  @{editor.username}
                                </Text>
                              </VStack>
                              <Badge colorScheme="green" variant="outline" size="sm">
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
            </CardHeader>
          </Card>

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
            <Alert status="info" w="100%">
              <AlertIcon />
              <Text wordBreak="break-word" fontSize={{ base: "sm", md: "md" }}>
                Tento příspěvek zatím neobsahuje žádný text ani přílohy.
              </Text>
            </Alert>
          )}

          {/* Modal pro potvrzení smazání příspěvku */}
          <DeletePostModal
            isOpen={isDeleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            onConfirm={handleDeletePost}
            postId={id ? parseInt(id) : 0}
            isDeleting={false}
          />
        </VStack>
      </Box>
    </Box>
  );
};

export default PostDetailPage;
