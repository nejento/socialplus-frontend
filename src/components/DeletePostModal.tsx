import React from 'react';
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
  AlertIcon,
  AlertDescription,
} from '@chakra-ui/react';

interface DeletePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  postId: number;
  isDeleting?: boolean;
}

const DeletePostModal: React.FC<DeletePostModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  postId,
  isDeleting = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Smazat příspěvek</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Text>
              Opravdu chcete smazat příspěvek #{postId}?
            </Text>
            <Alert status="warning" borderRadius="md">
              <AlertIcon />
              <AlertDescription>
                Tato akce je nevratná. Publikované příspěvky nelze smazat.
              </AlertDescription>
            </Alert>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose} isDisabled={isDeleting}>
            Zrušit
          </Button>
          <Button
            colorScheme="red"
            onClick={() => onConfirm()}
            isLoading={isDeleting}
            loadingText="Mazání..."
          >
            Smazat příspěvek
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DeletePostModal;
