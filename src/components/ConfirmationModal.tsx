import React from 'react';
import {
  DialogRoot,
  DialogBackdrop,
  DialogContent,
  DialogPositioner,
  DialogHeader,
  DialogBody,
  DialogCloseTrigger,
  DialogFooter,
  Button,
  Text
} from '@chakra-ui/react';

interface ConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  loading?: boolean;
  colorPalette?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  open,
  onClose,
  title,
  message,
  confirmText = 'Potvrdit',
  cancelText = 'Zrušit',
  onConfirm,
  loading = false,
  colorPalette = 'red'
}) => {
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <DialogRoot open={open} onOpenChange={({ open }) => !open && onClose()}>
      <DialogBackdrop />
      <DialogPositioner>
        <DialogContent>
          <DialogHeader>
            <Text fontSize="lg" fontWeight="bold">
              {title}
            </Text>
          </DialogHeader>

          <DialogCloseTrigger />

          <DialogBody>
            <Text>
              {message}
            </Text>
          </DialogBody>

          <DialogFooter gap={3}>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              {cancelText}
            </Button>
            <Button
              colorPalette={colorPalette}
              onClick={handleConfirm}
              loading={loading}
            >
              {confirmText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  );
};

export default ConfirmationModal;
