import React from 'react';
import {
  Box,
  VStack,
  Text,
  Button,
  Badge,
  HStack,
  IconButton,
  Icon
} from '@chakra-ui/react';
import { MdEdit } from 'react-icons/md';
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

interface NetworkProps {
  network: OwnedNetwork;
  onEdit: (networkId: number) => void;
  isOwnNetwork?: boolean;
  showAdminBadge?: boolean;
}

const Network: React.FC<NetworkProps> = ({
  network,
  onEdit,
  isOwnNetwork = true
}) => {
  const typeInfo = getNetworkTypeInfo(network.networkType);

  // Určíme, zda zobrazit tlačítko pro úpravu (pouze pro vlastní sítě)
  const showEditButton = isOwnNetwork;

  // Určíme, zda zobrazit poznámku (neukázat u administrovaných sítí)
  const showNote = isOwnNetwork && network.note;

  return (
    <Box
      bg={{ base: "white", _dark: "gray.800" }}
      borderColor={{ base: "gray.200", _dark: "gray.600" }}
      borderWidth="1px"
      borderRadius="lg"
      p={4}
      shadow="sm"
      transition="all 0.2s"
      _hover={{
        bg: { base: "gray.50", _dark: "gray.700" },
        borderColor: { base: "gray.300", _dark: "gray.500" },
        shadow: 'md'
      }}
      position="relative"
    >
      <VStack gap={4} align="stretch">
        <HStack justify="space-between" align="start">
          <VStack align="start" gap={2} flex={1}>
            <HStack gap={2} align="start" width="100%">
              <VStack align="start" gap={1} flex={1}>
                <Text fontWeight="bold" fontSize="lg" truncate>
                  {network.networkName}
                </Text>
                <Badge colorPalette="blue" variant="subtle" size="sm">
                  ID: {network.networkId}
                </Badge>
              </VStack>
              {typeInfo && (
                <Badge
                  colorPalette={typeInfo.color}
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
              size="sm"
              variant="ghost"
              onClick={() => onEdit(network.networkId)}
              flexShrink={0}
            >
              <Icon as={MdEdit} />
            </IconButton>
          )}
        </HStack>

        <VStack align="start" gap={3}>
          {showNote && (
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={1}>
                Poznámka:
              </Text>
              <Text fontSize="sm" color={{ base: "gray.800", _dark: "white" }} whiteSpace="pre-wrap">
                {network.note}
              </Text>
            </Box>
          )}

          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={1}>
              Vlastník:
            </Text>
            <Text fontSize="sm" color={{ base: "gray.800", _dark: "white" }}>
              {network.owner.displayname} (@{network.owner.username})
            </Text>
          </Box>

          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={1}>
              Oprávnění:
            </Text>
            <Badge
              colorPalette={
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
              colorPalette="blue"
              variant="outline"
              onClick={() => onEdit(network.networkId)}
              width="full"
            >
              Upravit nastavení
            </Button>
          )}
        </VStack>
      </VStack>
    </Box>
  );
};

export default Network;
