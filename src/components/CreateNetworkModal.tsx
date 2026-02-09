import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  Alert,
  AlertIcon,
  AlertDescription,
  Text,
  useToast,
  SimpleGrid,
  Box,
  useColorModeValue,
} from '@chakra-ui/react';
import { networkAPI } from '../services/api';
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
  isOpen: boolean;
  onClose: () => void;
  onNetworkCreated: (networkId: number) => void;
}

const CreateNetworkModal: React.FC<CreateNetworkModalProps> = ({
  isOpen,
  onClose,
  onNetworkCreated,
}) => {
  const [networkType, setNetworkType] = useState<NetworkType | null>(null);
  const [networkName, setNetworkName] = useState('');
  const [networkNote, setNetworkNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const selectedBg = useColorModeValue('blue.50', 'blue.900');
  const selectedBorder = useColorModeValue('blue.500', 'blue.300');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

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
        networkNote: networkNote.trim(),
      });

      toast({
        title: 'Síť byla vytvořena',
        description: `Sociální síť "${networkName}" byla úspěšně vytvořena`,
        status: 'success',
        duration: 5000,
        isClosable: true,
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
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Vytvořit novou sociální síť</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={6}>
            {error && (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Network Type Selection */}
            <FormControl isRequired>
              <FormLabel fontWeight="bold">Typ sociální sítě</FormLabel>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                {NETWORK_TYPES.map((network) => (
                  <Box
                    key={network.type}
                    as="button"
                    type="button"
                    p={4}
                    borderWidth="2px"
                    borderRadius="lg"
                    borderColor={networkType === network.type ? selectedBorder : 'gray.200'}
                    bg={networkType === network.type ? selectedBg : 'transparent'}
                    cursor="pointer"
                    transition="all 0.2s"
                    _hover={{
                      bg: networkType === network.type ? selectedBg : hoverBg,
                      borderColor: networkType === network.type ? selectedBorder : 'gray.300',
                    }}
                    onClick={() => setNetworkType(network.type)}
                    textAlign="left"
                  >
                    <VStack align="start" spacing={2}>
                      <Text fontWeight="bold" fontSize="sm" color={networkType === network.type ? `${network.color}.600` : 'inherit'}>
                        {network.displayName}
                      </Text>
                      <Text fontSize="xs" color={useColorModeValue('gray.600', 'gray.400')}>
                        {network.description}
                      </Text>
                    </VStack>
                  </Box>
                ))}
              </SimpleGrid>
              <Text fontSize="xs" color="gray.500" mt={2}>
                Typ sítě nelze po vytvoření změnit
              </Text>
            </FormControl>

            {/* Network Name */}
            <FormControl isRequired>
              <FormLabel>Název sociální sítě</FormLabel>
              <Input
                value={networkName}
                onChange={(e) => setNetworkName(e.target.value)}
                placeholder="Zadejte název sítě"
                maxLength={100}
              />
              <Text fontSize="xs" color="gray.500" mt={1}>
                Název musí být unikátní
              </Text>
            </FormControl>

            {/* Network Note */}
            <FormControl>
              <FormLabel>Poznámka</FormLabel>
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
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose}>
            Zrušit
          </Button>
          <Button
            colorScheme="green"
            onClick={handleSubmit}
            isLoading={isLoading}
            loadingText="Vytváří se..."
            disabled={!networkType || !networkName.trim()}
          >
            Vytvořit síť
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateNetworkModal;
