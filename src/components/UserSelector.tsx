import React, { useState } from 'react';
import {
  Box,
  VStack,
  Text,
  Button,
  SimpleGrid
} from '@chakra-ui/react';
import { User, PostEditor } from '@/types';
import UserSelectionModal from './UserSelectionModal';

interface UserSelectorProps {
  currentEditors: (User | PostEditor)[];
  onAddEditor: (userId: number, username?: string) => void;
  onRemoveEditor: (userId: number) => void;
  isOwner: boolean;
  disabled?: boolean;
}

const getEditorId = (editor: User | PostEditor) => 'userId' in editor ? editor.userId : editor.id;
const getEditorDisplayName = (editor: User | PostEditor) => 'displayname' in editor ? editor.displayname : editor.username;

const UserSelector: React.FC<UserSelectorProps> = ({
  currentEditors,
  onAddEditor,
  onRemoveEditor,
  isOwner,
  disabled = false
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddEditor = (userId: number) => {
    onAddEditor(userId);
    setIsModalOpen(false);
  };

  return (
    <Box
      bg={{ base: "white", _dark: "gray.800" }}
      borderWidth="1px"
      borderColor={{ base: "gray.200", _dark: "gray.600" }}
      borderRadius="md"
      p={4}
    >
      <VStack gap={4} align="stretch">
        <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="bold">
          Správa editorů
        </Text>

        {isOwner && (
          <Button
            size={{ base: 'sm', md: 'md' }}
            colorPalette="blue"
            onClick={() => setIsModalOpen(true)}
            disabled={disabled}
          >
            Přidat editora
          </Button>
        )}

        {currentEditors && currentEditors.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
            {currentEditors.map((editor) => {
              const id = getEditorId(editor);
              const displayName = getEditorDisplayName(editor);
              return (
                <Box
                  key={id}
                  p={3}
                  borderWidth="1px"
                  borderRadius="md"
                  borderColor={{ base: "gray.200", _dark: "gray.600" }}
                  bg={{ base: "gray.50", _dark: "gray.700" }}
                >
                  <VStack align="start" gap={2}>
                    <Text fontWeight="medium" fontSize="sm">
                      {editor.username}
                    </Text>
                    <Text fontSize="xs" color={{ base: "gray.600", _dark: "gray.400" }}>
                      {displayName || 'Bez jména'}
                    </Text>
                    {isOwner && (
                      <Button
                        size="xs"
                        colorPalette="red"
                        variant="ghost"
                        onClick={() => onRemoveEditor(id)}
                        disabled={disabled}
                      >
                        Odebrat
                      </Button>
                    )}
                  </VStack>
                </Box>
              );
            })}
          </SimpleGrid>
        ) : (
          <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }}>
            Žádní editoři nejsou přiřazeni.
          </Text>
        )}

        <UserSelectionModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSelect={handleAddEditor}
          loading={disabled}
        />
      </VStack>
    </Box>
  );
};

export default UserSelector;
