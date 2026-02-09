import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  useColorModeValue,
  Spinner,
  IconButton,
  Badge,
  Tag,
  TagLabel,
  Wrap,
  WrapItem,
  Tooltip,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router';
import { EditIcon, ViewIcon, DeleteIcon, AttachmentIcon } from '@chakra-ui/icons';
import { PostDetailedListItem, PostCardData, PostCardPermissions } from '@/types';
import { useDeletePost } from '../hooks/useDeletePost';
import DeletePostModal from './DeletePostModal';

interface PostCardProps {
  post: PostDetailedListItem;
  isContentLoading?: boolean;
  onPostDeleted?: (postId: number) => void;
  showDeleteModal?: boolean;
  permissions?: PostCardPermissions;
  networkName?: string;
  currentUserId?: number;
  networksMap?: Map<number, string>; // Mapování networkId na název sítě
}

const PostCard: React.FC<PostCardProps> = ({
  post, 
  isContentLoading = false, 
  onPostDeleted, 
  showDeleteModal = true,
  permissions,
  networkName,
  currentUserId,
  networksMap
}) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const contentBg = useColorModeValue('gray.50', 'gray.600');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');
  const navigate = useNavigate();

  // Normalizace dat - převedeme PostDetailedListItem na jednotné rozhraní
  const normalizePostData = (post: PostDetailedListItem): PostCardData => {
    // PostDetailedListItem - detailní typ s objektem creator
    return {
      postId: post.postId,
      creator: post.creator,
      createdAt: post.scheduledTimes[0]?.postDate || new Date().toISOString(),
      firstContent: post.contents[0]?.content,
      contents: post.contents.map(c => ({
        contentId: c.id,
        content: c.content,
        postDate: post.scheduledTimes.find(st => st.contentId === c.id)?.postDate || '',
        actualPostDate: post.scheduledTimes.find(st => st.contentId === c.id)?.actualPostDate || '',
        networkPostId: post.scheduledTimes.find(st => st.contentId === c.id)?.networkPostId || ''
      })),
      attachments: post.attachments
    };
  };

  const postData = normalizePostData(post);

  // Logika oprávnění - pokud nejsou předána explicitní oprávnění, odvodíme je
  const getPermissions = (): PostCardPermissions => {
    if (permissions) {
      return permissions;
    }

    // Nyní podporujeme pouze PostDetailedListItem s kompletními informacemi
    if (currentUserId) {
      const isCreator = postData.creator.id === currentUserId;
      const isEditor = 'editors' in post && post.editors.some(editor => editor.userId === currentUserId);

      return {
        canEdit: isCreator || isEditor,
        canDelete: isCreator // Pouze tvůrce může mazat
      };
    }

    return { canEdit: false, canDelete: false };
  };

  const currentPermissions = getPermissions();

  // Funkce pro určení stavu příspěvku a odpovídajícího textu
  const getPostStatusInfo = () => {
    // Pro PostDetailedListItem máme scheduledTimes
    if ('scheduledTimes' in post && post.scheduledTimes.length > 0) {
      // Zkontrolujeme, zda existují nějaké zveřejněné příspěvky
      const publishedTimes = post.scheduledTimes.filter(st => st.actualPostDate);

      if (publishedTimes.length > 0) {
        // Pokud jsou nějaké příspěvky zveřejněné, zobrazíme "Zveřejněno"
        return {
          status: 'published',
          text: 'Zveřejněno',
          date: publishedTimes[0].actualPostDate
        };
      }

      // Pokud nejsou žádné zveřejněné, zkontrolujeme plánování
      const scheduledTimes = post.scheduledTimes.filter(st => st.postDate);
      if (scheduledTimes.length > 0) {
        const uniqueTimes = new Set(scheduledTimes.map(st => st.postDate));

        if (uniqueTimes.size === 1) {
          // Všechny mají stejný čas plánování
          return {
            status: 'scheduled',
            text: 'Naplánováno',
            date: scheduledTimes[0].postDate
          };
        } else {
          // Různé časy plánování
          return {
            status: 'scheduled',
            text: `Naplánováno na ${uniqueTimes.size} různých časů`,
            date: null
          };
        }
      }
    }

    // Pokud příspěvek nemá žádné plánování ani publikování - "Nevydáno"
    return {
      status: 'unpublished',
      text: 'Nevydáno',
      date: null
    };
  };

  const {
    deleteModal,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,
  } = useDeletePost({
    onSuccess: onPostDeleted,
    showModal: showDeleteModal
  });

  const handleEditClick = () => {
    navigate(`/posts/edit/${postData.postId}`);
  };

  const handleViewClick = () => {
    navigate(`/posts/${postData.postId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = () => {
    if (postData.status) {
      const statusMap: Record<string, { colorScheme: string; label: string }> = {
        draft: { colorScheme: 'gray', label: 'Koncept' },
        published: { colorScheme: 'green', label: 'Publikováno' },
        scheduled: { colorScheme: 'blue', label: 'Naplánováno' },
        unpublished: { colorScheme: 'red', label: 'Nevydáno' },
      };

      const statusInfo = statusMap[postData.status] || { colorScheme: 'gray', label: postData.status };

      return (
        <Badge colorScheme={statusInfo.colorScheme} variant="subtle">
          {statusInfo.label}
        </Badge>
      );
    }
    return null;
  };

  const getContentPreview = () => {
    if (isContentLoading) {
      return (
        <Box p={3} bg={contentBg} borderRadius="md">
          <HStack spacing={2}>
            <Spinner size="sm" />
            <Text fontSize="sm" color={mutedColor}>
              Načítání obsahu...
            </Text>
          </HStack>
        </Box>
      );
    }

    if (postData.firstContent) {
      const preview = postData.firstContent.length > 150
        ? postData.firstContent.substring(0, 150) + '...'
        : postData.firstContent;

      return (
        <Box p={3} bg={contentBg} borderRadius="md">
          <Text fontSize="sm" whiteSpace="pre-wrap">
            {preview}
          </Text>
        </Box>
      );
    }

    if (postData.contents && postData.contents.length > 0) {
      const firstContent = postData.contents[0].content;
      const preview = firstContent.length > 150
        ? firstContent.substring(0, 150) + '...'
        : firstContent;

      return (
        <Box p={3} bg={contentBg} borderRadius="md">
          <Text fontSize="sm" whiteSpace="pre-wrap">
            {preview}
          </Text>
        </Box>
      );
    }

    return (
      <Box p={3} bg={contentBg} borderRadius="md">
        <Text fontSize="sm" color={mutedColor} fontStyle="italic">
          Zatím bez obsahu
        </Text>
      </Box>
    );
  };

  const getAttachmentsCount = () => {
    if (postData.attachments) {
      return postData.attachments.length;
    }
    return 0;
  };

  const getContentsCount = () => {
    if (postData.contents) {
      return postData.contents.length;
    }
    return 0;
  };

  const getNetworkTags = () => {
    // Pro PostDetailedListItem zobrazíme sítě z obsahu s názvy ze sítě mapy
    if ('contents' in post && 'scheduledTimes' in post) {
      const networkIds = new Set<number>();
      post.contents.forEach(content => {
        content.linkedNetworks.forEach(networkId => networkIds.add(networkId));
      });

      if (networkIds.size > 0) {
        return (
          <Wrap spacing={1}>
            {Array.from(networkIds).map(networkId => {
              // Použijeme networksMap pro získání názvu sítě
              const networkName = networksMap?.get(networkId) || `Síť ${networkId}`;
              return (
                <WrapItem key={networkId}>
                  <Tag size="sm" colorScheme="blue" variant="subtle">
                    <TagLabel>{networkName}</TagLabel>
                  </Tag>
                </WrapItem>
              );
            })}
          </Wrap>
        );
      }
    }

    // Pro NetworkPostItem zobrazíme název sítě
    if (networkName) {
      return (
        <Tag size="sm" colorScheme="green" variant="subtle">
          <TagLabel>{networkName}</TagLabel>
        </Tag>
      );
    }

    return null;
  };

  return (
    <>
      <Box
        bg={cardBg}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="lg"
        p={4}
        shadow="sm"
        transition="all 0.2s"
        _hover={{
          bg: useColorModeValue('gray.50', 'gray.650'),
          borderColor: useColorModeValue('gray.300', 'gray.500'),
          shadow: 'md',
        }}
      >
        <VStack spacing={4} align="stretch">
          {/* Header s ID příspěvku a statusem */}
          <HStack justifyContent="space-between" align="start">
            <VStack align="start" spacing={1}>
              <HStack>
                <Text fontWeight="bold" fontSize="lg">
                  Příspěvek #{postData.postId}
                </Text>
                {getStatusBadge()}
              </HStack>

              {/* Datum */}
              <Text
                fontSize="sm"
                color={(() => {
                  const statusInfo = getPostStatusInfo();
                  switch (statusInfo.status) {
                    case 'published':
                      return useColorModeValue('green.600', 'green.400');
                    case 'scheduled':
                      return useColorModeValue('yellow.600', 'yellow.400');
                    case 'unpublished':
                      return mutedColor;
                    default:
                      return textColor;
                  }
                })()}
                fontWeight={(() => {
                  const statusInfo = getPostStatusInfo();
                  return statusInfo.status === 'published' || statusInfo.status === 'scheduled'
                    ? 'medium'
                    : 'normal';
                })()}
              >
                {(() => {
                  const statusInfo = getPostStatusInfo();
                  if (statusInfo.date) {
                    return `${statusInfo.text}: ${formatDate(statusInfo.date)}`;
                  }
                  return statusInfo.text;
                })()}
              </Text>

              {/* Síťové tagy */}
              {getNetworkTags()}
            </VStack>

            {/* Akční tlačítka */}
            <HStack spacing={1}>
              <Tooltip label="Zobrazit detail">
                <IconButton
                  aria-label="Zobrazit detail"
                  icon={<ViewIcon />}
                  size="sm"
                  variant="ghost"
                  onClick={handleViewClick}
                />
              </Tooltip>

              {currentPermissions.canEdit && (
                <Tooltip label="Editovat">
                  <IconButton
                    aria-label="Editovat příspěvek"
                    icon={<EditIcon />}
                    size="sm"
                    variant="ghost"
                    colorScheme="blue"
                    onClick={handleEditClick}
                  />
                </Tooltip>
              )}

              {currentPermissions.canDelete && showDeleteModal && (
                <Tooltip label="Smazat">
                  <IconButton
                    aria-label="Smazat příspěvek"
                    icon={<DeleteIcon />}
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    onClick={() => openDeleteModal(postData.postId)}
                  />
                </Tooltip>
              )}
            </HStack>
          </HStack>

          {/* Náhled obsahu */}
          {getContentPreview()}

          {/* Footer s informacemi */}
          <HStack justifyContent="space-between" align="center">
            <HStack spacing={4}>
              {getContentsCount() > 0 && (
                <Text fontSize="sm" color={textColor}>
                  {getContentsCount()} {getContentsCount() === 1 ? 'obsah' : 'obsahy'}
                </Text>
              )}

              {getAttachmentsCount() > 0 && (
                <HStack spacing={1}>
                  <AttachmentIcon color={textColor} boxSize={3} />
                  <Text fontSize="sm" color={textColor}>
                    {getAttachmentsCount()}
                  </Text>
                </HStack>
              )}
            </HStack>

            <Text fontSize="xs" color={mutedColor}>
              Vytvořil: {postData.creator.username}
            </Text>
          </HStack>
        </VStack>
      </Box>

      {/* Delete Modal */}
      {showDeleteModal && (
        <DeletePostModal
          isOpen={deleteModal.isOpen}
          onClose={closeDeleteModal}
          onConfirm={confirmDelete}
          postId={postData.postId}
        />
      )}
    </>
  );
};

export default PostCard;
