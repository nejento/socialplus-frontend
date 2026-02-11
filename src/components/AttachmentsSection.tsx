import React from 'react';
import {
  VStack,
  HStack,
  Input,
  Button,
  Text,
  Box,
  SimpleGrid,
  Spinner,
  Heading
} from '@chakra-ui/react';
import { PostFile, NetworkInfo, FileUpload } from '@/types';
import { FileAttachment } from './FileAttachment';

interface AttachmentsSectionProps {
  currentPostId: number;
  postFiles: PostFile[];
  uploadingFiles: FileUpload[];
  availableNetworks: NetworkInfo[];
  selectedNetworksByAttachment: Map<number, number[]>;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onNetworkToggle: (attachmentId: number, networkId: number, isSelected: boolean) => void;
  onRemoveFile: (fileId: number) => void;
  isNetworkSelectorDisabled: boolean;
  isUploadDisabled: boolean;
  maxFileSizeFormatted: string;
}

export const AttachmentsSection: React.FC<AttachmentsSectionProps> = ({
  currentPostId,
  postFiles,
  uploadingFiles,
  availableNetworks,
  selectedNetworksByAttachment,
  onFileUpload,
  onNetworkToggle,
  onRemoveFile,
  isNetworkSelectorDisabled,
  isUploadDisabled,
  maxFileSizeFormatted
}) => {
  return (
    <>
      <Heading color={{ base: "gray.800", _dark: "white" }} fontSize={{ base: 'md', md: 'lg' }}>
        Přílohy
      </Heading>

      <VStack gap={4} align="stretch">
        <HStack gap={4}>
          <Input
            type="file"
            accept="*/*"
            multiple
            onChange={onFileUpload}
            display="none"
            id="file-upload"
          />
          <Button
            asChild
            cursor="pointer"
            size={{ base: 'sm', md: 'md' }}
            disabled={isUploadDisabled}
          >
            <label htmlFor="file-upload">Nahrát soubory</label>
          </Button>
          <Text fontSize="xs" color={{ base: 'gray.600', _dark: 'gray.400' }}>
            Maximální velikost: {maxFileSizeFormatted}
          </Text>
        </HStack>

        {/* Zobrazení nahrávaných souborů */}
        {uploadingFiles.length > 0 && (
          <VStack gap={2} align="stretch">
            <Text fontSize="sm" fontWeight="medium" color={{ base: "gray.800", _dark: "white" }}>
              Nahrávání...
            </Text>
            {uploadingFiles.map((upload, index) => (
              <Box
                key={index}
                p={3}
                borderWidth="1px"
                borderRadius="md"
                borderColor={{ base: 'blue.200', _dark: 'blue.600' }}
                bg={{ base: 'blue.50', _dark: 'blue.900' }}
              >
                <HStack justify="space-between">
                  <VStack align="start" gap={1} flex={1}>
                    <Text fontSize="sm" fontWeight="medium" truncate>
                      {upload.file.name}
                    </Text>
                    <Text fontSize="xs" color={{ base: 'gray.600', _dark: 'gray.400' }}>
                      {(upload.file.size / 1024 / 1024).toFixed(2)} MB
                    </Text>
                  </VStack>
                  <HStack gap={2}>
                    {upload.uploading ? (
                      <Spinner size="sm" color="blue.500" />
                    ) : upload.error ? (
                      <Text fontSize="xs" color="red.500">
                        {upload.error}
                      </Text>
                    ) : null}
                  </HStack>
                </HStack>
              </Box>
            ))}
          </VStack>
        )}

        {/* Zobrazení existujících souborů */}
        {postFiles.length > 0 && (
          <VStack gap={3} align="stretch">
            <Text fontSize="sm" fontWeight="medium" color={{ base: "gray.800", _dark: "white" }}>
              Nahrané soubory ({postFiles.length})
            </Text>
            <SimpleGrid
              columns={{ base: 1, md: 2 }}
              gap={{ base: 3, md: 4 }}
            >
              {postFiles.map((file) => (
                <FileAttachment
                  key={file.id}
                  file={file}
                  postId={currentPostId}
                  availableNetworks={availableNetworks}
                  selectedNetworkIds={selectedNetworksByAttachment.get(file.id) || []}
                  onNetworkToggle={onNetworkToggle}
                  isNetworkSelectorDisabled={isNetworkSelectorDisabled}
                  onRemove={onRemoveFile}
                />
              ))}
            </SimpleGrid>
          </VStack>
        )}
      </VStack>
    </>
  );
};
