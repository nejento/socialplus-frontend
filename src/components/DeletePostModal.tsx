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

interface DeletePostModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  postTitle?: string;
  isDeleting?: boolean;
}

const DeletePostModal: React.FC<DeletePostModalProps> = ({
  open,
  onClose,
  onConfirm,
  postTitle,
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
              Smazat příspěvek
            </Text>
          </DialogHeader>

          <DialogCloseTrigger />

          <DialogBody>
            <VStack gap={4} align="stretch">
              <Text>
                {postTitle
                  ? `Opravdu chcete smazat příspěvek "${postTitle}"?`
                  : 'Opravdu chcete smazat tento příspěvek?'
                }
              </Text>

              <Text fontSize="sm" color={{ base: "red.600", _dark: "red.400" }}>
                ⚠️ Tato akce je nevratná. Všechny obsahy a přílohy budou také smazány.
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
              Smazat příspěvek
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  );
};

export default DeletePostModal;
