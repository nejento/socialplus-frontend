import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Text,
  VStack,
  Checkbox
} from '@chakra-ui/react';
import { NetworkInfo } from '@/types';

interface NetworkSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  authorizedNetworks: NetworkInfo[];
  selectedNetworks: number[];
  onNetworkToggle: (networkId: number, isSelected: boolean) => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export const NetworkSelectionModal: React.FC<NetworkSelectionModalProps> = ({
  isOpen,
  onClose,
  authorizedNetworks,
  selectedNetworks,
  onNetworkToggle,
  onConfirm,
  isLoading
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Výběr sociálních sítí</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text mb={4}>
            Vyberte sociální sítě, na které chcete příspěvek okamžitě odeslat:
          </Text>

          <VStack spacing={3} align="stretch">
            {authorizedNetworks.map(network => (
              <Checkbox
                key={network.id}
                isChecked={selectedNetworks.includes(network.id)}
                onChange={(e) => onNetworkToggle(network.id, e.target.checked)}
                colorScheme="blue"
              >
                <Text fontSize="sm">
                  {network.networkName}
                  {network.isOwned ? ' (vlastní)' : ` (${network.owner?.username})`}
                </Text>
              </Checkbox>
            ))}
          </VStack>

          {authorizedNetworks.length === 0 && (
            <Text fontSize="sm" color="orange.500" mt={3}>
              Nemáte oprávnění odeslat příspěvek na žádnou ze sociálních sítí.
            </Text>
          )}

          {selectedNetworks.length === 0 && authorizedNetworks.length > 0 && (
            <Text fontSize="sm" color="red.500" mt={3}>
              Vyberte alespoň jednu síť pro odeslání.
            </Text>
          )}
        </ModalBody>

        <ModalFooter>
          <Button
            colorScheme="orange"
            onClick={onConfirm}
            isLoading={isLoading}
            isDisabled={selectedNetworks.length === 0}
            mr={3}
          >
            Odeslat na vybrané sítě ({selectedNetworks.length})
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Zrušit
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
