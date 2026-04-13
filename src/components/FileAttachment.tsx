import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  IconButton,
  Icon
} from '@chakra-ui/react';
import { MdDownload, MdVisibility, MdClose } from 'react-icons/md';
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
  availableNetworks = [],
  selectedNetworkIds = [],
  onNetworkToggle,
  onRemove,
  isNetworkSelectorDisabled = false
}) => {
  const handleDownload = async () => {
    try {
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
    } catch (error) {
      console.error('Chyba při stahování souboru:', error);
    }
  };

  const handlePreview = () => {
    // Placeholder pro budoucí implementaci náhledu
    console.log('Preview:', file.fileName);
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove(file.id);
    }
  };

  const isImage = file.fileType?.startsWith('image/');

  return (
    <Box
      p={3}
      borderWidth="1px"
      borderRadius="md"
      borderColor={{ base: "gray.200", _dark: "gray.600" }}
      bg={{ base: "gray.50", _dark: "gray.700" }}
      position="relative"
    >
      <VStack gap={3} align="stretch">
        <HStack justify="space-between">
          <VStack align="start" gap={1} flex={1}>
            <Text fontSize="sm" fontWeight="medium" truncate>
              {file.fileName}
            </Text>
            <Text fontSize="xs" color={{ base: "gray.500", _dark: "gray.400" }}>
              {file.fileType} • {(file.fileSize / 1024 / 1024).toFixed(2)} MB
            </Text>
          </VStack>

          <HStack gap={1}>
            <IconButton
              aria-label="Stáhnout soubor"
              onClick={handleDownload}
              size="sm"
              variant="ghost"
            >
              <Icon as={MdDownload} />
            </IconButton>

            {isImage && (
              <IconButton
                aria-label="Zobrazit náhled"
                onClick={handlePreview}
                size="sm"
                variant="ghost"
              >
                <Icon as={MdVisibility} />
              </IconButton>
            )}

            {onRemove && (
              <IconButton
                aria-label="Odstranit soubor"
                onClick={handleRemove}
                size="sm"
                variant="ghost"
                colorPalette="red"
              >
                <Icon as={MdClose} />
              </IconButton>
            )}
          </HStack>
        </HStack>

        {/* Obrázek náhled */}
        {isImage && (
          <Box>
            <img
              src={`/api/posts/${postId}/files/${file.id}/preview`}
              alt={file.fileName}
              style={{
                width: '100%',
                height: '150px',
                objectFit: 'cover',
                borderRadius: '6px'
              }}
            />
          </Box>
        )}

        {/* Network Selector */}
        {availableNetworks.length > 0 && onNetworkToggle && (
          <Box>
            <Text fontSize="xs" fontWeight="medium" mb={2} color={{ base: "gray.700", _dark: "gray.300" }}>
              Sociální sítě:
            </Text>
            <NetworkSelector
              availableNetworks={availableNetworks}
              selectedNetworkIds={selectedNetworkIds}
              onNetworkToggle={(networkId, isSelected) =>
                onNetworkToggle(file.id, networkId, isSelected)
              }
              loading={false}
              disabled={isNetworkSelectorDisabled}
            />
          </Box>
        )}
      </VStack>
    </Box>
  );
};
