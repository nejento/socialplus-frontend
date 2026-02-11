import React, { useState, useEffect } from 'react';
import {
  DialogRoot,
  DialogBackdrop,
  DialogContent,
  DialogPositioner,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
  Button,
  Input,
  VStack,
  Text,
  Box,
  Field
} from '@chakra-ui/react';
import { userAPI } from '../services/api';

interface UserSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (userId: number) => void;
  loading?: boolean;
}

const UserSelectionModal: React.FC<UserSelectionModalProps> = ({
  open,
  onClose,
  onSelect,
  loading = false
}) => {
  const [username, setUsername] = useState('');
  const [foundUser, setFoundUser] = useState<any | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setUsername('');
      setFoundUser(null);
      setSearchError(null);
    }
  }, [open]);

  const handleSearch = async () => {
    if (!username.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    setFoundUser(null);

    try {
      const response = await userAPI.getUserByUsername(username.trim());
      setFoundUser(response.data);
    } catch (error) {
      setSearchError('Uživatel nebyl nalezen.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelect = () => {
    if (foundUser) {
      onSelect(foundUser.id);
      onClose();
    }
  };

  return (
    <DialogRoot open={open} onOpenChange={({ open }) => !open && onClose()}>
      <DialogBackdrop />
      <DialogPositioner>
        <DialogContent>
          <DialogHeader>Vybrat uživatele</DialogHeader>
          <DialogCloseTrigger />

          <DialogBody>
            <VStack gap={4} align="stretch">
              <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }}>
                Zadejte uživatelské jméno editora, kterého chcete přidat.
              </Text>

              <Field.Root invalid={!!searchError}>
                <Field.Label>Uživatelské jméno</Field.Label>
                <VStack align="stretch" gap={2}>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Např. jan.novak"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSearch();
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSearch}
                    loading={isSearching}
                    disabled={!username.trim()}
                  >
                    Vyhledat
                  </Button>
                </VStack>
                <Field.ErrorText>{searchError}</Field.ErrorText>
              </Field.Root>

              {foundUser && (
                <Box
                  p={3}
                  bg={{ base: "green.50", _dark: "green.900" }}
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor={{ base: "green.200", _dark: "green.700" }}
                >
                  <VStack align="start" gap={1}>
                    <Text fontWeight="bold">Nalezen uživatel:</Text>
                    <Text>{foundUser.displayname || foundUser.username}</Text>
                    <Text fontSize="xs" color={{ base: "gray.600", _dark: "gray.400" }}>
                      @{foundUser.username}
                    </Text>
                  </VStack>
                </Box>
              )}
            </VStack>
          </DialogBody>

          <DialogFooter gap={3}>
            <Button variant="ghost" onClick={onClose}>
              Zrušit
            </Button>
            <Button
              colorPalette="blue"
              onClick={handleSelect}
              disabled={!foundUser || loading}
              loading={loading}
            >
              Přidat editora
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  );
};

export default UserSelectionModal;
