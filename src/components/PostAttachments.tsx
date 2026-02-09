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
  IconButton,
  SimpleGrid,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { DownloadIcon } from '@chakra-ui/icons';
import { postsAPI } from '../services/api';
import {
  NetworkInfo,
  PostDetailedListItem,
} from '@/types';

interface PostAttachmentsProps {
  postId: number;
  post: PostDetailedListItem;
  networks: NetworkInfo[];
}

const PostAttachments: React.FC<PostAttachmentsProps> = ({ postId, post, networks }) => {
  const toast = useToast();
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

  const handleDownloadFile = async (fileId: number, fileName: string) => {
    try {
      const response = await postsAPI.downloadFile(postId, fileId);

      // Vytvoříme blob URL a spustíme stahování
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Chyba při stahování souboru:', error);
      toast({
        title: 'Chyba',
        description: 'Nepodařilo se stáhnout soubor',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Pokud nejsou přílohy, nezobrazujeme komponentu
  if (!post.attachments || post.attachments.length === 0) {
    return null;
  }

  return (
    <Card bg={cardBg} borderColor={borderColor} width="100%">
      <CardHeader>
        <Heading size="md">Přílohy</Heading>
      </CardHeader>
      <CardBody>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          {post.attachments.map((file) => (
            <Box
              key={file.id}
              p={4}
              borderWidth="1px"
              borderRadius="md"
              borderColor={borderColor}
            >
              <VStack spacing={3} align="stretch">
                <HStack justifyContent="space-between">
                  <Text fontWeight="bold" fontSize="sm" noOfLines={1}>
                    {file.fileName}
                  </Text>
                  <IconButton
                    aria-label="Stáhnout soubor"
                    icon={<DownloadIcon />}
                    size="sm"
                    onClick={() => handleDownloadFile(file.id, file.fileName)}
                  />
                </HStack>

                {file.linkedNetworks.length > 0 && (
                  <VStack align="stretch" spacing={2}>
                    <Text fontSize="xs" color={textColor}>
                      Přiřazeno k sítím:
                    </Text>
                    <HStack spacing={1} flexWrap="wrap">
                      {file.linkedNetworks.map(networkId => (
                        <Badge key={networkId} colorScheme="green" size="sm">
                          {getNetworkName(networkId)}
                        </Badge>
                      ))}
                    </HStack>
                  </VStack>
                )}
              </VStack>
            </Box>
          ))}
        </SimpleGrid>
      </CardBody>
    </Card>
  );
};

export default PostAttachments;
