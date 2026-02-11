import React from 'react';
import {
  Box,
  Heading,
  VStack,
  HStack,
  Text,
  Badge,
  IconButton,
  SimpleGrid,
  Icon
} from '@chakra-ui/react';
import { MdDownload } from 'react-icons/md';
import { postsAPI } from '../services/api';
import {
  NetworkInfo,
  PostDetailedListItem
} from '@/types';

interface PostAttachmentsProps {
  postId: number;
  post: PostDetailedListItem;
  networks: NetworkInfo[];
}

const PostAttachments: React.FC<PostAttachmentsProps> = ({ postId, post, networks }) => {

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
      // toast() // Not available in Chakra v3
    }
  };

  // Pokud nejsou přílohy, nezobrazujeme komponentu
  if (!post.attachments || post.attachments.length === 0) {
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
        <Heading size="md">Přílohy</Heading>
      </Box>
      <Box p={4}>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
          {post.attachments.map((file) => (
            <Box
              key={file.id}
              p={4}
              borderWidth="1px"
              borderRadius="md"
              borderColor={{ base: "gray.200", _dark: "gray.600" }}
            >
              <VStack gap={3} align="stretch">
                <HStack justifyContent="space-between">
                  <Text fontWeight="bold" fontSize="sm" lineClamp={1}>
                    {file.fileName}
                  </Text>
                  <IconButton
                    aria-label="Stáhnout soubor"
                    size="sm"
                    onClick={() => handleDownloadFile(file.id, file.fileName)}
                  >
                    <Icon as={MdDownload} />
                  </IconButton>
                </HStack>

                {file.linkedNetworks.length > 0 && (
                  <VStack align="stretch" gap={2}>
                    <Text fontSize="xs" color={{ base: "gray.800", _dark: "white" }}>
                      Přiřazeno k sítím:
                    </Text>
                    <HStack gap={1} flexWrap="wrap">
                      {file.linkedNetworks.map(networkId => (
                        <Badge key={networkId} colorPalette="green" size="sm">
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
      </Box>
    </Box>
  );
};

export default PostAttachments;
