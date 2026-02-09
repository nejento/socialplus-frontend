import React from 'react';
import {
  Box,
  VStack,
  Text,
  Button,
  Card,
  Badge,
  HStack,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react';
import { EditIcon } from '@chakra-ui/icons';
import { OwnedNetwork, NetworkType } from '@/types';

// Network type configurations with display names and colors
const NETWORK_TYPES: {
  type: NetworkType;
  displayName: string;
  color: string;
}[] = [
  { type: 'facebook', displayName: 'Facebook', color: 'blue' },
  { type: 'twitter', displayName: 'Twitter (X)', color: 'twitter' },
  { type: 'mastodon', displayName: 'Mastodon', color: 'purple' },
  { type: 'bluesky', displayName: 'Bluesky', color: 'cyan' },
  { type: 'threads', displayName: 'Threads', color: 'green' },
];

const getNetworkTypeInfo = (type: NetworkType) => {
  return NETWORK_TYPES.find(nt => nt.type === type);
};

interface NetworkCardProps {
  network: OwnedNetwork;
  onEdit: (networkId: number) => void;
  isOwnNetwork?: boolean;
  showAdminBadge?: boolean;
}

const NetworkCard: React.FC<NetworkCardProps> = ({
  network,
  onEdit,
  isOwnNetwork = true
}) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const typeInfo = getNetworkTypeInfo(network.networkType);

  // Určíme, zda zobrazit tlačítko pro úpravu (pouze pro vlastní sítě)
  const showEditButton = isOwnNetwork;

  // Určíme, zda zobrazit poznámku (neukázat u administrovaných sítí)
  const showNote = isOwnNetwork && network.note;

  return (
    <Card
      bg={cardBg}
      borderColor={borderColor}
      borderWidth="1px"
      borderRadius="lg"
      p={4}
      shadow="sm"
      transition="all 0.2s"
      _hover={{
        bg: useColorModeValue('gray.50', 'gray.650'),
        borderColor: useColorModeValue('gray.300', 'gray.500'),
        shadow: 'md',
      }}
      position="relative"
    >
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between" align="start">
          <VStack align="start" spacing={2} flex={1}>
            <HStack spacing={2} align="start" width="100%">
              <VStack align="start" spacing={1} flex={1}>
                <Text fontWeight="bold" fontSize="lg" isTruncated>
                  {network.networkName}
                </Text>
                <Badge colorScheme="blue" variant="subtle" size="sm">
                  ID: {network.networkId}
                </Badge>
              </VStack>
              {typeInfo && (
                <Badge
                  colorScheme={typeInfo.color}
                  variant="solid"
                  size="sm"
                  flexShrink={0}
                >
                  {typeInfo.displayName}
                </Badge>
              )}
            </HStack>
          </VStack>
          {showEditButton && (
            <IconButton
              aria-label="Upravit síť"
              icon={<EditIcon />}
              size="sm"
              variant="ghost"
              onClick={() => onEdit(network.networkId)}
              flexShrink={0}
            />
          )}
        </HStack>

        <VStack align="start" spacing={3}>
          {showNote && (
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={1}>
                Poznámka:
              </Text>
              <Text fontSize="sm" color={textColor} whiteSpace="pre-wrap">
                {network.note}
              </Text>
            </Box>
          )}

          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={1}>
              Vlastník:
            </Text>
            <Text fontSize="sm" color={textColor}>
              {network.owner.displayname} (@{network.owner.username})
            </Text>
          </Box>

          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={1}>
              Oprávnění:
            </Text>
            <Badge
              colorScheme={
                network.permission === 'admin' ? 'red' :
                network.permission === 'write' ? 'green' : 'blue'
              }
              size="sm"
            >
              {network.permission === 'admin' ? 'Administrátor' :
               network.permission === 'write' ? 'Zápis' : 'Čtení'}
            </Badge>
          </Box>

          {showEditButton && (
            <Button
              size="sm"
              colorScheme="blue"
              variant="outline"
              leftIcon={<EditIcon />}
              onClick={() => onEdit(network.networkId)}
              width="full"
            >
              Upravit nastavení
            </Button>
          )}
        </VStack>
      </VStack>
    </Card>
  );
};

export default NetworkCard;
