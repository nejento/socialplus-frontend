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
  Text,
  VStack
} from '@chakra-ui/react';

interface DeleteNetworkModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  networkName: string;
  isDeleting?: boolean;
}

const DeleteNetworkModal: React.FC<DeleteNetworkModalProps> = ({
  open,
  onClose,
  onConfirm,
  networkName,
  isDeleting = false
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
    <DialogRoot open={open} onOpenChange={({ open }) => !open && onClose()}>
      <DialogBackdrop />
      <DialogPositioner>
        <DialogContent>
          <DialogHeader>
            <Text fontSize="lg" fontWeight="bold" color="red.500">
              Smazat síť
            </Text>
          </DialogHeader>

          <DialogCloseTrigger />

          <DialogBody>
            <VStack gap={4} align="stretch">
              <Text>
                Opravdu chcete smazat síť <strong>{networkName}</strong>?
              </Text>

              <Text fontSize="sm" color={{ base: "red.600", _dark: "red.400" }}>
                ⚠️ Tato akce je nevratná. Všechny tokeny a oprávnění pro tuto síť budou také smazány.
              </Text>
            </VStack>
          </DialogBody>

          <DialogFooter gap={3}>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isConfirming || isDeleting}
            >
              Zrušit
            </Button>
            <Button
              colorPalette="red"
              onClick={handleConfirm}
              loading={isConfirming || isDeleting}
            >
              Smazat síť
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  );
};

export default DeleteNetworkModal;
