import React from 'react';
import {
  Box,
  Button,
  HStack,
  Text,
  Spinner,
  Wrap,
  WrapItem } from '@chakra-ui/react';
import { NetworkInfo } from '@/types';

interface NetworkSelectorProps {
  availableNetworks: NetworkInfo[];
  selectedNetworkIds: number[];
  onNetworkToggle: (networkId: number, isSelected: boolean) => void;
  loading?: boolean;
  disabled?: boolean;
}

const NetworkSelector: React.FC<NetworkSelectorProps> = ({
  availableNetworks,
  selectedNetworkIds,
  onNetworkToggle,
  loading = false,
  disabled = false
}) => {
  if (loading) {
    return (
      <HStack gap={2}>
        <Spinner size="sm" />
        <Text fontSize="sm">Načítání sítí...</Text>
      </HStack>
    );
  }

  if (availableNetworks.length === 0) {
    return (
      <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }}>
        Žádné dostupné sociální sítě
      </Text>
    );
  }

  return (
    <Box>
      <Text fontSize="sm" fontWeight="medium" mb={2}>
        Vyberte sociální sítě:
      </Text>
      <Wrap gap={2}>
        {availableNetworks.map((network) => {
          const isSelected = selectedNetworkIds.includes(network.id);

          return (
            <WrapItem key={network.id}>
              <Button
                size="sm"
                variant={isSelected ? "solid" : "outline"}
                bg={isSelected ? { base: "blue.500", _dark: "blue.600" } : { base: "white", _dark: "gray.700" }}
                color={isSelected ? "white" : undefined}
                borderColor={{ base: "gray.200", _dark: "gray.600" }}
                onClick={() => onNetworkToggle(network.id, !isSelected)}
                disabled={disabled}
                _hover={{
                  bg: isSelected ? { base: "blue.500", _dark: "blue.600" } : { base: "gray.50", _dark: "gray.600" }
                }}
              >
                <Box textAlign="left">
                  <Text fontSize="sm" fontWeight="medium">
                    {network.networkName}
                  </Text>
                  {!network.isOwned && network.owner && (
                    <Text fontSize="xs" color={isSelected ? "white" : { base: "gray.600", _dark: "gray.400" }}>
                      ({network.owner.username})
                    </Text>
                  )}
                </Box>
              </Button>
            </WrapItem>
          );
        })}
      </Wrap>
    </Box>
  );
};

export default NetworkSelector;
