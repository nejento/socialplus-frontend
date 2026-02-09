import React from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardBody,
  Heading,
  VStack,
  HStack,
  Text,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  NetworkInfo,
  PostDetailedListItem,
} from '@/types';

interface PostContentsProps {
  post: PostDetailedListItem;
  networks: NetworkInfo[];
}

const PostContents: React.FC<PostContentsProps> = ({ post, networks }) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');

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
    <Card bg={cardBg} borderColor={borderColor} width="100%">
      <CardHeader>
        <Heading size="md">Texty příspěvků</Heading>
      </CardHeader>
      <CardBody>
        <VStack spacing={4} align="stretch">
          {post.contents.map((content, index) => {
            const scheduledTimes = getScheduledTimesForContent(content.id);
            return (
              <Box key={content.id} p={4} borderWidth="1px" borderRadius="md">
                <VStack align="stretch" spacing={3}>
                  <HStack justifyContent="space-between">
                    <Text fontWeight="bold" fontSize="sm" color={textColor}>
                      Text #{index + 1}
                    </Text>
                    {content.linkedNetworks.length > 0 && (
                      <HStack spacing={2}>
                        <Text fontSize="xs" color={textColor}>Sociální sítě:</Text>
                        {content.linkedNetworks.map(networkId => (
                          <Badge key={networkId} colorScheme="blue" size="sm">
                            {getNetworkName(networkId)}
                          </Badge>
                        ))}
                      </HStack>
                    )}
                  </HStack>
                  <Text
                    p={3}
                    bg={useColorModeValue('gray.50', 'gray.600')}
                    borderRadius="md"
                    whiteSpace="pre-wrap"
                  >
                    {content.content}
                  </Text>

                  {/* Informace o naplánovaných časech */}
                  {scheduledTimes.length > 0 && (
                    <VStack align="stretch" spacing={2} mt={2}>
                      <Text fontSize="xs" fontWeight="bold" color={textColor}>
                        Plánování publikování:
                      </Text>
                      {scheduledTimes.map((scheduled, idx) => (
                        <Box key={idx} p={2} bg={useColorModeValue('blue.50', 'blue.900')} borderRadius="sm">
                          <VStack align="stretch" spacing={1}>
                            <HStack justify="space-between">
                              <Badge colorScheme="blue" size="sm">
                                {getNetworkName(scheduled.networkId)}
                              </Badge>
                              <HStack spacing={2}>
                                {scheduled.networkPostId && (
                                  <Text fontSize="xs" color={textColor}>
                                    ID: {scheduled.networkPostId}
                                  </Text>
                                )}
                              </HStack>
                            </HStack>
                            {scheduled.postDate && (() => {
                              const postDate = new Date(scheduled.postDate);
                              return !isNaN(postDate.getTime()) && (
                                <Text fontSize="xs" color={textColor}>
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

                  <Text fontSize="xs" color={textColor}>
                    Počet znaků: {content.content.length}
                  </Text>
                </VStack>
              </Box>
            );
          })}
        </VStack>
      </CardBody>
    </Card>
  );
};

export default PostContents;
