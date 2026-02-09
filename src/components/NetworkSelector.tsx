import React from 'react';
import {
  Box,
  Button,
  HStack,
  Text,
  useColorModeValue,
  Spinner,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { NetworkInfo } from '@/types';

interface NetworkSelectorProps {
  availableNetworks: NetworkInfo[];
  selectedNetworkIds: number[];
  onNetworkToggle: (networkId: number, isSelected: boolean) => void;
  isLoading?: boolean;
  isDisabled?: boolean;
}

const NetworkSelector: React.FC<NetworkSelectorProps> = ({
  availableNetworks,
  selectedNetworkIds,
  onNetworkToggle,
  isLoading = false,
  isDisabled = false,
}) => {
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const selectedBg = useColorModeValue('blue.500', 'blue.600');
  const selectedColor = useColorModeValue('white', 'white');
  const ownerTextColor = useColorModeValue('gray.600', 'gray.400');

  if (isLoading) {
    return (
      <HStack spacing={2}>
        <Spinner size="sm" />
        <Text fontSize="sm">Načítání sítí...</Text>
      </HStack>
    );
  }

  if (availableNetworks.length === 0) {
    return (
      <Text fontSize="sm" color={ownerTextColor}>
        Žádné dostupné sociální sítě
      </Text>
    );
  }

  return (
    <Box>
      <Text fontSize="sm" fontWeight="medium" mb={2}>
        Vyberte sociální sítě:
      </Text>
      <Wrap spacing={2}>
        {availableNetworks.map((network) => {
          const isSelected = selectedNetworkIds.includes(network.id);

          return (
            <WrapItem key={network.id}>
              <Button
                size="sm"
                variant={isSelected ? "solid" : "outline"}
                bg={isSelected ? selectedBg : bgColor}
                color={isSelected ? selectedColor : undefined}
                borderColor={borderColor}
                onClick={() => onNetworkToggle(network.id, !isSelected)}
                isDisabled={isDisabled}
                _hover={{
                  bg: isSelected ? selectedBg : useColorModeValue('gray.50', 'gray.600'),
                }}
              >
                <Box textAlign="left">
                  <Text fontSize="sm" fontWeight="medium">
                    {network.networkName}
                  </Text>
                  {!network.isOwned && network.owner && (
                    <Text fontSize="xs" color={isSelected ? selectedColor : ownerTextColor}>
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
