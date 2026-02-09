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
  Text,
  VStack,
  Alert,
  AlertIcon
} from '@chakra-ui/react';

interface DeleteNetworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  networkName: string;
  isDeleting?: boolean;
}

const DeleteNetworkModal: React.FC<DeleteNetworkModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  networkName
}) => {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm();
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Odstranit sociální síť</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Text>
              Opravdu chcete odstranit sociální síť <strong>"{networkName}"</strong>?
            </Text>

            <Alert status="warning" borderRadius="md">
              <AlertIcon />
              <VStack align="start" spacing={2} flex={1}>
                <Text fontWeight="medium" fontSize="sm">
                  Důležité upozornění:
                </Text>
                <Text fontSize="sm">
                  Sociální síť je možné odstranit jen tehdy, pokud neexistuje příspěvek s obsahem připojeným na danou síť.
                </Text>
              </VStack>
            </Alert>

            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <Text fontSize="sm" fontWeight="medium">
                Tato akce je nevratná.
              </Text>
            </Alert>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="ghost"
            mr={3}
            onClick={onClose}
            isDisabled={isConfirming}
          >
            Zrušit
          </Button>
          <Button
            colorScheme="red"
            onClick={handleConfirm}
            isLoading={isConfirming}
            loadingText="Odstraňujem..."
          >
            Odstranit síť
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DeleteNetworkModal;
