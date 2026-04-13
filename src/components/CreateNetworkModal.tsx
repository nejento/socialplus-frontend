import React, { useState } from 'react';
import {
  DialogRoot,
  DialogBackdrop,
  DialogContent,
  DialogPositioner,
  DialogHeader,
  DialogFooter,
  DialogBody,
  DialogCloseTrigger,
  Button,
  Input,
  Textarea,
  VStack,
  Text,
  SimpleGrid,
  Box,
  Field
} from '@chakra-ui/react';
import { networkAPI } from '../services/api';
import { toaster } from './ui/toaster';
import { NetworkType } from '@/types';

// Network type configurations
const NETWORK_TYPES: {
  type: NetworkType;
  displayName: string;
  color: string;
  description: string;
}[] = [
  { type: 'facebook', displayName: 'Facebook', color: 'blue', description: 'Facebook stránky a profily' },
  { type: 'twitter', displayName: 'Twitter (X)', color: 'twitter', description: 'Twitter/X účty' },
  { type: 'mastodon', displayName: 'Mastodon', color: 'purple', description: 'Mastodon instance' },
  { type: 'bluesky', displayName: 'Bluesky', color: 'cyan', description: 'Bluesky profily' },
  { type: 'threads', displayName: 'Threads', color: 'green', description: 'Meta Threads profily' },
];

interface CreateNetworkModalProps {
  open: boolean;
  onClose: () => void;
  onNetworkCreated: (networkId: number) => void;
}

const CreateNetworkModal: React.FC<CreateNetworkModalProps> = ({
  open,
  onClose,
  onNetworkCreated
}) => {
  const [networkType, setNetworkType] = useState<NetworkType | null>(null);
  const [networkName, setNetworkName] = useState('');
  const [networkNote, setNetworkNote] = useState('');
  const [loading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setNetworkType(null);
    setNetworkName('');
    setNetworkNote('');
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!networkType) {
      setError('Vyberte typ sociální sítě');
      return;
    }

    if (!networkName.trim()) {
      setError('Název sociální sítě je povinný');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await networkAPI.createNetwork({
        networkType,
        networkName: networkName.trim(),
        networkNote: networkNote.trim()
      });

      toaster.create({
        title: 'Síť byla vytvořena',
        description: `Sociální síť "${networkName}" byla úspěšně vytvořena`,
        type: 'success',
        duration: 5000
      });

      onNetworkCreated(response.data.networkId);
      handleClose();
    } catch (error: any) {
      console.error('Chyba při vytváření sítě:', error);

      let errorMessage = 'Nepodařilo se vytvořit sociální síť';
      if (error.response?.status === 409) {
        errorMessage = 'Síť s tímto názvem již existuje. Zvolte jiný název.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DialogRoot open={open} onOpenChange={(e) => !e.open && handleClose()} size="lg">
      <DialogBackdrop />
      <DialogPositioner>
        <DialogContent>
          <DialogHeader>Vytvořit novou sociální síť</DialogHeader>
          <DialogCloseTrigger />

          <DialogBody>
            <VStack gap={6}>
              {error && (
                <Box
                  p={3}
                  bg={{ base: "red.50", _dark: "red.900" }}
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor={{ base: "red.200", _dark: "red.700" }}
                >
                  <Text color={{ base: "red.800", _dark: "red.200" }} fontSize="sm">
                    {error}
                  </Text>
                </Box>
              )}

              {/* Network Type Selection */}
              <Field.Root required>
                <Field.Label fontWeight="bold">Typ sociální sítě</Field.Label>
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
                  {NETWORK_TYPES.map((network) => (
                    <Button
                      key={network.type}
                      variant="outline"
                      p={4}
                      height="auto"
                      borderWidth="2px"
                      borderRadius="lg"
                      borderColor={networkType === network.type ? { base: "blue.500", _dark: "blue.300" } : { base: "gray.200", _dark: "gray.600" }}
                      bg={networkType === network.type ? { base: "blue.50", _dark: "blue.900" } : 'transparent'}
                      cursor="pointer"
                      transition="all 0.2s"
                      _hover={{
                        bg: networkType === network.type ? { base: "blue.50", _dark: "blue.900" } : { base: "gray.50", _dark: "gray.700" },
                        borderColor: networkType === network.type ? { base: "blue.500", _dark: "blue.300" } : { base: "gray.300", _dark: "gray.500" }
                      }}
                      onClick={() => setNetworkType(network.type)}
                      textAlign="left"
                      justifyContent="flex-start"
                    >
                      <VStack align="start" gap={2}>
                        <Text fontWeight="bold" fontSize="sm" color={networkType === network.type ? `${network.color}.600` : 'inherit'}>
                          {network.displayName}
                        </Text>
                        <Text fontSize="xs" color={{ base: "gray.600", _dark: "gray.400" }}>
                          {network.description}
                        </Text>
                      </VStack>
                    </Button>
                  ))}
                </SimpleGrid>
                <Text fontSize="xs" color="gray.500" mt={2}>
                  Typ sítě nelze po vytvoření změnit
                </Text>
              </Field.Root>

              {/* Network Name */}
              <Field.Root required>
                <Field.Label>Název sociální sítě</Field.Label>
                <Input
                  value={networkName}
                  onChange={(e) => setNetworkName(e.target.value)}
                  placeholder="Zadejte název sítě"
                  maxLength={100}
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Název musí být unikátní
                </Text>
              </Field.Root>

              {/* Network Note */}
              <Field.Root>
                <Field.Label>Poznámka</Field.Label>
                <Textarea
                  value={networkNote}
                  onChange={(e) => setNetworkNote(e.target.value)}
                  placeholder="Volitelná poznámka k sociální síti"
                  rows={4}
                  maxLength={500}
                  resize="vertical"
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  {networkNote.length}/500 znaků
                </Text>
              </Field.Root>
            </VStack>
          </DialogBody>

          <DialogFooter gap={3}>
            <Button variant="ghost" onClick={handleClose}>
              Zrušit
            </Button>
            <Button
              colorPalette="green"
              onClick={handleSubmit}
              loading={loading}
              loadingText="Vytváří se..."
              disabled={!networkType || !networkName.trim()}
            >
              Vytvořit síť
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  );
};

export default CreateNetworkModal;
