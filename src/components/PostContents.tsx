import React from 'react';
import {
  Box,
  Heading,
  VStack,
  HStack,
  Text,
  Badge
} from '@chakra-ui/react';
import {
  NetworkInfo,
  PostDetailedListItem
} from '@/types';

interface PostContentsProps {
  post: PostDetailedListItem;
  networks: NetworkInfo[];
}

const PostContents: React.FC<PostContentsProps> = ({ post, networks }) => {

  // Pomocná funkce pro získání názvu sítě podle ID
  const getNetworkName = (networkId: number): React.ReactElement => {
    const network = networks.find(n => n.networkId === networkId);

    if (!network) {
      return (
        <Text as="span" fontSize="inherit">
          Síť #{networkId}
        </Text>
      );
    }

    // Pokud je síť naše (permission = admin), zobrazujeme pouze název
    if (network.permission === 'admin') {
      return (
        <Text as="span" fontSize="inherit">
          {network.networkName}
        </Text>
      );
    }

    // Pokud síť není naše, zobrazujeme název a vlastníka v šedé barvě
    return (
      <Text as="span" fontSize="inherit">
        {network.networkName}
        {network.owner && (
          <Text as="span" color="gray.500" ml={1}>
            ({network.owner.username})
          </Text>
        )}
      </Text>
    );
  };

  // Pomocná funkce pro získání informací o scheduledTimes pro obsah
  const getScheduledTimesForContent = (contentId: number) => {
    return post.scheduledTimes?.filter(st => st.contentId === contentId) || [];
  };

  // Pokud není obsah, nezobrazujeme komponentu
  if (!post.contents || post.contents.length === 0) {
    return null;
  }

  return (
    <Box
      bg={{ base: "white", _dark: "gray.800" }}
      borderWidth="1px"
      borderColor={{ base: "gray.200", _dark: "gray.600" }}
      borderRadius="md"
      width="100%"
    >
      <Box p={4} borderBottom="1px" borderColor={{ base: "gray.200", _dark: "gray.600" }}>
        <Heading size="md">Texty příspěvků</Heading>
      </Box>
      <Box p={4}>
        <VStack gap={4} align="stretch">
          {post.contents.map((content, index) => {
            const scheduledTimes = getScheduledTimesForContent(content.id);
            return (
              <Box key={content.id} p={4} borderWidth="1px" borderRadius="md" borderColor={{ base: "gray.200", _dark: "gray.600" }}>
                <VStack align="stretch" gap={3}>
                  <HStack justifyContent="space-between">
                    <Text fontWeight="bold" fontSize="sm" color={{ base: "gray.800", _dark: "white" }}>
                      Text #{index + 1}
                    </Text>
                    {content.linkedNetworks.length > 0 && (
                      <HStack gap={2}>
                        <Text fontSize="xs" color={{ base: "gray.800", _dark: "white" }}>Sociální sítě:</Text>
                        {content.linkedNetworks.map(networkId => (
                          <Badge key={networkId} colorPalette="blue" size="sm">
                            {getNetworkName(networkId)}
                          </Badge>
                        ))}
                      </HStack>
                    )}
                  </HStack>
                  <Text
                    p={3}
                    bg={{ base: "gray.50", _dark: "gray.600" }}
                    borderRadius="md"
                    whiteSpace="pre-wrap"
                  >
                    {content.content}
                  </Text>

                  {/* Informace o naplánovaných časech */}
                  {scheduledTimes.length > 0 && (
                    <VStack align="stretch" gap={2} mt={2}>
                      <Text fontSize="xs" fontWeight="bold" color={{ base: "gray.800", _dark: "white" }}>
                        Plánování publikování:
                      </Text>
                      {scheduledTimes.map((scheduled, idx) => (
                        <Box key={idx} p={2} bg={{ base: "blue.50", _dark: "blue.900" }} borderRadius="sm">
                          <VStack align="stretch" gap={1}>
                            <HStack justify="space-between">
                              <Badge colorPalette="blue" size="sm">
                                {getNetworkName(scheduled.networkId)}
                              </Badge>
                              <HStack gap={2}>
                                {scheduled.networkPostId && (
                                  <Text fontSize="xs" color={{ base: "gray.800", _dark: "white" }}>
                                    ID: {scheduled.networkPostId}
                                  </Text>
                                )}
                              </HStack>
                            </HStack>
                            {scheduled.postDate && (() => {
                              const postDate = new Date(scheduled.postDate);
                              return !isNaN(postDate.getTime()) && (
                                <Text fontSize="xs" color={{ base: "gray.800", _dark: "white" }}>
                                  Naplánováno: {postDate.toLocaleString('cs-CZ')}
                                </Text>
                              );
                            })()}
                            {scheduled.actualPostDate && (() => {
                              const actualDate = new Date(scheduled.actualPostDate);
                              return !isNaN(actualDate.getTime()) && (
                                <Text fontSize="xs" color="green.600">
                                  Publikováno: {actualDate.toLocaleString('cs-CZ')}
                                </Text>
                              );
                            })()}
                          </VStack>
                        </Box>
                      ))}
                    </VStack>
                  )}

                  <Text fontSize="xs" color={{ base: "gray.800", _dark: "white" }}>
                    Počet znaků: {content.content.length}
                  </Text>
                </VStack>
              </Box>
            );
          })}
        </VStack>
      </Box>
    </Box>
  );
};

export default PostContents;
