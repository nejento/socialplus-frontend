import React from 'react';
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
  Text,
  VStack,
  CheckboxRoot,
  CheckboxLabel,
  CheckboxControl
} from '@chakra-ui/react';
import { NetworkInfo } from '@/types';

interface NetworkSelectionModalProps {
  open: boolean;
  onClose: () => void;
  authorizedNetworks: NetworkInfo[];
  selectedNetworks: number[];
  onNetworkToggle: (networkId: number, isSelected: boolean) => void;
  onConfirm: () => void;
  loading: boolean;
}

export const NetworkSelectionModal: React.FC<NetworkSelectionModalProps> = ({
  open,
  onClose,
  authorizedNetworks,
  selectedNetworks,
  onNetworkToggle,
  onConfirm,
  loading
}) => {
  return (
    <DialogRoot open={open} onOpenChange={({ open }) => !open && onClose()}>
      <DialogBackdrop />
      <DialogPositioner>
        <DialogContent>
          <DialogHeader>
            <Text fontSize="lg" fontWeight="bold">
              Vyberte sociální sítě
            </Text>
          </DialogHeader>

          <DialogCloseTrigger />

          <DialogBody>
            <VStack gap={3} align="stretch">
              <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }}>
                Vyberte sítě, na které chcete příspěvek okamžitě odeslat:
              </Text>

              {authorizedNetworks.length === 0 ? (
                <Text fontSize="sm" color={{ base: "gray.500", _dark: "gray.500" }}>
                  Nejsou k dispozici žádné autorizované sítě.
                </Text>
              ) : (
                <VStack gap={2} align="stretch">
                  {authorizedNetworks.map((network) => (
                    <CheckboxRoot
                      key={network.id}
                      checked={selectedNetworks.includes(network.id)}
                      onCheckedChange={(details) => onNetworkToggle(network.id, details.checked === true)}
                    >
                      <CheckboxControl />
                      <CheckboxLabel>
                        <Text fontSize="sm">
                          {network.networkName}
                        </Text>
                      </CheckboxLabel>
                    </CheckboxRoot>
                  ))}
                </VStack>
              )}
            </VStack>
          </DialogBody>

          <DialogFooter gap={3}>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Zrušit
            </Button>
            <Button
              colorPalette="blue"
              onClick={onConfirm}
              loading={loading}
              disabled={selectedNetworks.length === 0}
            >
              Odeslat na vybrané sítě ({selectedNetworks.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  );
};
