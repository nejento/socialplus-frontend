import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Spinner,
  IconButton,
  Badge,
  Wrap,
  WrapItem,
  Icon
} from '@chakra-ui/react';
import { useNavigate } from 'react-router';
import { MdEdit, MdVisibility, MdDelete, MdAttachFile } from 'react-icons/md';
import { PostDetailedListItem, PostCardPermissions } from '@/types';
import { useDeletePost } from '../hooks/useDeletePost';
import DeletePostModal from './DeletePostModal';

// Pomocné typy
interface PostData {
  postId: number;
  creator: { id: number; username: string };
  createdAt: string;
  firstContent?: string;
  contents?: Array<{
    contentId: number;
    content: string;
    postDate: string;
    actualPostDate: string;
    networkPostId: string;
  }>;
  attachments?: any[];
  status?: string;
}

interface PostPermissions {
  canEdit: boolean;
  canDelete: boolean;
}

interface PostProps {
  post: PostDetailedListItem;
  isContentLoading?: boolean;
  onPostDeleted?: (postId: number) => void;
  showDeleteModal?: boolean;
  permissions?: PostCardPermissions;
  networkName?: string;
  currentUserId?: number;
  networksMap?: Map<number, string>;
}

const Post: React.FC<PostProps> = ({
  post, 
  isContentLoading = false, 
  onPostDeleted, 
  showDeleteModal = true,
  permissions,
  networkName,
  currentUserId,
  networksMap
}) => {
  const navigate = useNavigate();

  // Normalizace dat - převedeme PostDetailedListItem na jednotné rozhraní
  const normalizePostData = (post: PostDetailedListItem): PostData => {
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
  const getPermissions = (): PostPermissions => {
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
    confirmDelete } = useDeletePost({
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
        unpublished: { colorScheme: 'red', label: 'Nevydáno' } };

      const statusInfo = statusMap[postData.status] || { colorScheme: 'gray', label: postData.status };

      return (
        <Badge colorPalette={statusInfo.colorScheme} variant="subtle">
          {statusInfo.label}
        </Badge>
      );
    }
    return null;
  };

  const getContentPreview = () => {
    if (isContentLoading) {
      return (
        <Box p={3} bg={{ base: "gray.50", _dark: "gray.600" }} borderRadius="md">
          <HStack gap={2}>
            <Spinner size="sm" />
            <Text fontSize="sm" color={{ base: "gray.500", _dark: "gray.400" }}>
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
        <Box p={3} bg={{ base: "gray.50", _dark: "gray.600" }} borderRadius="md">
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
        <Box p={3} bg={{ base: "gray.50", _dark: "gray.600" }} borderRadius="md">
          <Text fontSize="sm" whiteSpace="pre-wrap">
            {preview}
          </Text>
        </Box>
      );
    }

    return (
      <Box p={3} bg={{ base: "gray.50", _dark: "gray.600" }} borderRadius="md">
        <Text fontSize="sm" color={{ base: "gray.500", _dark: "gray.400" }} fontStyle="italic">
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
          <Wrap gap={1}>
            {Array.from(networkIds).map(networkId => {
              // Použijeme networksMap pro získání názvu sítě
              const networkName = networksMap?.get(networkId) || `Síť ${networkId}`;
              return (
                <WrapItem key={networkId}>
                  <Badge size="sm" colorPalette="blue" variant="subtle">
                    {networkName}
                  </Badge>
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
        <Badge size="sm" colorPalette="green" variant="subtle">
          {networkName}
        </Badge>
      );
    }

    return null;
  };

  return (
    <>
      <Box
        bg={{ base: "white", _dark: "gray.800" }}
        borderWidth="1px"
        borderColor={{ base: "gray.200", _dark: "gray.600" }}
        borderRadius="lg"
        p={4}
        shadow="sm"
        transition="all 0.2s"
        _hover={{
          bg: { base: "gray.50", _dark: "gray.700" },
          borderColor: { base: "gray.300", _dark: "gray.500" },
          shadow: 'md'
        }}
      >
        <VStack gap={4} align="stretch">
          {/* Header s ID příspěvku a statusem */}
          <HStack justifyContent="space-between" align="start">
            <VStack align="start" gap={1}>
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
                      return { base: "green.600", _dark: "green.400" };
                    case 'scheduled':
                      return { base: "yellow.600", _dark: "yellow.400" };
                    case 'unpublished':
                      return { base: "gray.500", _dark: "gray.400" };
                    default:
                      return { base: "gray.600", _dark: "gray.300" };
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
            <HStack gap={1}>
              <IconButton
                aria-label="Zobrazit detail"
                size="sm"
                variant="ghost"
                onClick={handleViewClick}
              >
                <Icon as={MdVisibility} />
              </IconButton>

              {currentPermissions.canEdit && (
                <IconButton
                  aria-label="Editovat příspěvek"
                  size="sm"
                  variant="ghost"
                  colorPalette="blue"
                  onClick={handleEditClick}
                >
                  <Icon as={MdEdit} />
                </IconButton>
              )}

              {currentPermissions.canDelete && showDeleteModal && (
                <IconButton
                  aria-label="Smazat příspěvek"
                  size="sm"
                  variant="ghost"
                  colorPalette="red"
                  onClick={() => openDeleteModal(postData.postId)}
                >
                  <Icon as={MdDelete} />
                </IconButton>
              )}
            </HStack>
          </HStack>

          {/* Náhled obsahu */}
          {getContentPreview()}

          {/* Footer s informacemi */}
          <HStack justifyContent="space-between" align="center">
            <HStack gap={4}>
              {getContentsCount() > 0 && (
                <Text fontSize="sm" color={{ base: "gray.800", _dark: "white" }}>
                  {getContentsCount()} {getContentsCount() === 1 ? 'obsah' : 'obsahy'}
                </Text>
              )}

              {getAttachmentsCount() > 0 && (
                <HStack gap={1}>
                  <Icon as={MdAttachFile} color={{ base: "gray.800", _dark: "white" }} boxSize={3} />
                  <Text fontSize="sm" color={{ base: "gray.800", _dark: "white" }}>
                    {getAttachmentsCount()}
                  </Text>
                </HStack>
              )}
            </HStack>

            <Text fontSize="xs" color={{ base: "gray.500", _dark: "gray.400" }}>
              Vytvořil: {postData.creator.username}
            </Text>
          </HStack>
        </VStack>
      </Box>

      {/* Delete Modal */}
      {showDeleteModal && (
        <DeletePostModal
          open={deleteModal.isOpen}
          onClose={closeDeleteModal}
          onConfirm={confirmDelete}
        />
      )}
    </>
  );
};

export default Post;
