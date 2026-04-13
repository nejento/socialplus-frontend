import React from 'react';
import { HStack, Text, Spinner, Icon } from '@chakra-ui/react';
import { MdCheck } from 'react-icons/md';

interface SaveStatusIndicatorProps {
  status?: 'saved' | 'saving' | 'error';
  lastSaved?: Date;
}

export const SaveStatusIndicator: React.FC<SaveStatusIndicatorProps> = ({ status, lastSaved }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'saved': return 'green.500';
      case 'saving': return 'blue.500';
      case 'error': return 'red.500';
      default: return 'gray.500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'saved': return lastSaved ? `Uloženo ${lastSaved.toLocaleTimeString()}` : 'Uloženo';
      case 'saving': return 'Ukládání...';
      case 'error': return 'Chyba při ukládání';
      default: return '';
    }
  };

  if (!status) return null;

  return (
    <HStack gap={1}>
      {status === 'saved' && <Icon as={MdCheck} color={getStatusColor()} w={3} h={3} />}
      {status === 'saving' && <Spinner size="xs" color={getStatusColor()} />}
      <Text fontSize="xs" color={getStatusColor()}>
        {getStatusText()}
      </Text>
    </HStack>
  );
};
