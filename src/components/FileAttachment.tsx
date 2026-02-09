import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  IconButton,
  useToast,
  useColorModeValue
} from '@chakra-ui/react';
import { DownloadIcon, ViewIcon, CloseIcon } from '@chakra-ui/icons';
import { PostFile, NetworkInfo } from '@/types';
import { postsAPI } from '../services/api';
import NetworkSelector from './NetworkSelector';

interface FileAttachmentProps {
  file: PostFile;
  postId: number;
  onRemove?: (fileId: number) => void;
  availableNetworks?: NetworkInfo[];
  selectedNetworkIds?: number[];
  onNetworkToggle?: (attachmentId: number, networkId: number, isSelected: boolean) => void;
  isNetworkSelectorDisabled?: boolean;
}

export const FileAttachment: React.FC<FileAttachmentProps> = ({
  file,
  postId,
  onRemove,
  availableNetworks = [],
  selectedNetworkIds = [],
  onNetworkToggle,
  isNetworkSelectorDisabled = false
}) => {
  const [downloading, setDownloading] = useState(false);
  const toast = useToast();

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const response = await postsAPI.downloadFile(postId, file.id);

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Soubor stažen',
        status: 'success',
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: 'Chyba při stahování',
        description: 'Nepodařilo se stáhnout soubor',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleView = async () => {
    try {
      const response = await postsAPI.downloadFile(postId, file.id);

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);

      toast({
        title: 'Soubor zobrazen',
        status: 'success',
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: 'Chyba při zobrazení',
        description: 'Nepodařilo se zobrazit soubor',
        status: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <Box
      p={3}
      borderWidth="1px"
      borderRadius="md"
      borderColor={useColorModeValue('gray.200', 'gray.600')}
      bg={useColorModeValue('gray.50', 'gray.700')}
      position="relative"
    >
      <VStack spacing={3} align="stretch">
        <HStack justify="space-between">
          <VStack align="start" spacing={1} flex={1}>
            <Text fontSize="sm" fontWeight="medium" isTruncated>
              {file.fileName}
            </Text>
            <Text fontSize="xs" color={useColorModeValue('gray.600', 'gray.400')}>
              ID: {file.id}
            </Text>
          </VStack>
          <HStack spacing={2}>
            <IconButton
              aria-label="Stáhnout soubor"
              icon={<DownloadIcon />}
              size="sm"
              variant="ghost"
              onClick={handleDownload}
              isLoading={downloading}
            />
            <IconButton
              aria-label="Zobrazit soubor"
              icon={<ViewIcon />}
              size="sm"
              variant="ghost"
              onClick={handleView}
            />
            {onRemove && (
              <IconButton
                aria-label="Smazat soubor"
                icon={<CloseIcon />}
                size="sm"
                variant="ghost"
                colorScheme="red"
                onClick={() => onRemove(file.id)}
              />
            )}
          </HStack>
        </HStack>

        {availableNetworks.length > 0 && onNetworkToggle && (
          <Box pt={2} borderTop="1px" borderColor={useColorModeValue('gray.200', 'gray.600')}>
            <Text fontSize="xs" fontWeight="medium" color={useColorModeValue('gray.700', 'gray.300')} mb={2}>
              Sociální sítě:
            </Text>
            <NetworkSelector
              availableNetworks={availableNetworks}
              selectedNetworkIds={selectedNetworkIds}
              onNetworkToggle={(networkId, isSelected) => onNetworkToggle(file.id, networkId, isSelected)}
              isLoading={false}
              isDisabled={isNetworkSelectorDisabled}
            />
          </Box>
        )}
      </VStack>
    </Box>
  );
};
