import React from 'react';
import {
  FormControl,
  FormLabel,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  Box,
  SimpleGrid,
  Spinner,
  useColorModeValue
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
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
  const textColor = useColorModeValue('gray.800', 'white');

  return (
    <FormControl>
      <FormLabel color={textColor} fontSize={{ base: 'md', md: 'lg' }}>
        Přílohy
      </FormLabel>

      <VStack spacing={4} align="stretch">
        <HStack spacing={4}>
          <Input
            type="file"
            accept="*/*"
            multiple
            onChange={onFileUpload}
            display="none"
            id="file-upload"
          />
          <Button
            as="label"
            htmlFor="file-upload"
            cursor="pointer"
            leftIcon={<AddIcon />}
            size={{ base: 'sm', md: 'md' }}
            isDisabled={isUploadDisabled}
          >
            Nahrát soubory
          </Button>
          <Text fontSize="xs" color={useColorModeValue('gray.600', 'gray.400')}>
            Maximální velikost: {maxFileSizeFormatted}
          </Text>
        </HStack>

        {/* Zobrazení nahrávaných souborů */}
        {uploadingFiles.length > 0 && (
          <VStack spacing={2} align="stretch">
            <Text fontSize="sm" fontWeight="medium" color={textColor}>
              Nahrávání...
            </Text>
            {uploadingFiles.map((upload, index) => (
              <Box
                key={index}
                p={3}
                borderWidth="1px"
                borderRadius="md"
                borderColor={useColorModeValue('blue.200', 'blue.600')}
                bg={useColorModeValue('blue.50', 'blue.900')}
              >
                <HStack justify="space-between">
                  <VStack align="start" spacing={1} flex={1}>
                    <Text fontSize="sm" fontWeight="medium" isTruncated>
                      {upload.file.name}
                    </Text>
                    <Text fontSize="xs" color={useColorModeValue('gray.600', 'gray.400')}>
                      {(upload.file.size / 1024 / 1024).toFixed(2)} MB
                    </Text>
                  </VStack>
                  <HStack spacing={2}>
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
          <VStack spacing={3} align="stretch">
            <Text fontSize="sm" fontWeight="medium" color={textColor}>
              Nahrané soubory ({postFiles.length})
            </Text>
            <SimpleGrid
              columns={{ base: 1, md: 2 }}
              spacing={{ base: 3, md: 4 }}
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
    </FormControl>
  );
};
