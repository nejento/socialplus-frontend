import React from 'react';
import {
  VStack,
  Text,
  Box,
  HStack,
  Checkbox,
  Input,
  Button,
  useColorModeValue
} from '@chakra-ui/react';
import { NetworkInfo } from '@/types';

interface SchedulingSectionProps {
  availableNetworks: NetworkInfo[];
  existingSchedules: Map<number, string>;
  schedulingDates: Map<number, string>;
  sentNetworks: Set<number>;
  canManageScheduling: boolean;
  canScheduleOnNetwork: (networkId: number) => boolean;
  getLinkedNetworks: () => NetworkInfo[];
  onScheduleDateChange: (networkId: number, dateValue: string) => void;
  onUseForAll: () => void;
  onSaveScheduling: () => void;
  isSaving: boolean;
}

export const SchedulingSection: React.FC<SchedulingSectionProps> = ({
  availableNetworks,
  existingSchedules,
  schedulingDates,
  sentNetworks,
  canManageScheduling,
  canScheduleOnNetwork,
  getLinkedNetworks,
  onScheduleDateChange,
  onUseForAll,
  onSaveScheduling,
  isSaving
}) => {
  const textColor = useColorModeValue('gray.800', 'white');
  const inputBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <VStack align="stretch" spacing={4}>
      <Text fontSize="lg" fontWeight="semibold" color={textColor}>
        Plánování příspěvku
      </Text>

      {/* Zobrazení existujících plánů */}
      {existingSchedules.size > 0 && (
        <Box
          p={4}
          borderWidth="1px"
          borderRadius="md"
          borderColor={useColorModeValue('green.200', 'green.600')}
          bg={useColorModeValue('green.50', 'green.900')}
        >
          <Text fontSize="sm" color={useColorModeValue('green.800', 'green.200')}>
            Tento příspěvek je již naplánován na následující sítě:
          </Text>
          <VStack spacing={2} align="stretch" mt={2}>
            {Array.from(existingSchedules.entries()).map(([networkId, postDate]) => (
              <HStack key={networkId} justify="space-between">
                <Text fontSize="sm" color={textColor}>
                  {availableNetworks.find(network => network.id === networkId)?.networkName || 'Neznámá síť'}
                </Text>
                <Text fontSize="sm" color={textColor}>
                  {new Date(postDate).toLocaleString()}
                </Text>
              </HStack>
            ))}
          </VStack>
        </Box>
      )}

      {/* Kontrola oprávnění */}
      {!canManageScheduling && existingSchedules.size === 0 && (
        <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')} fontStyle="italic">
          Tento příspěvek není naplánován na žádné sociální síti.
        </Text>
      )}

      {/* Ovládací prvky pro plánování */}
      {canManageScheduling && (
        <>
          <VStack spacing={4} align="stretch">
            <Text fontSize="sm" color={textColor}>
              {getLinkedNetworks().length > 0
                ? "Vyberte datum a čas pro plánování příspěvku na jednotlivých sítích:"
                : "Nejprve připojte příspěvek k sociálním sítím, abyste mohli nastavit plánování."
              }
            </Text>
            {getLinkedNetworks().map(network => (
              <HStack key={network.id} spacing={4} align="start">
                <Checkbox
                  isChecked={schedulingDates.has(network.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      const defaultDate = new Date(Date.now() + 60 * 60 * 1000).toISOString();
                      onScheduleDateChange(network.id, defaultDate);
                    } else {
                      onScheduleDateChange(network.id, '');
                    }
                  }}
                  colorScheme="blue"
                  isDisabled={!canScheduleOnNetwork(network.id)}
                >
                  <Text fontSize="sm" color={textColor}>
                    {network.networkName}
                    {!canScheduleOnNetwork(network.id) && (
                      <Text as="span" fontSize="xs" color="gray.500" ml={2}>
                        (nemáte oprávnění)
                      </Text>
                    )}
                  </Text>
                </Checkbox>
                {schedulingDates.has(network.id) && canScheduleOnNetwork(network.id) && (
                  <Input
                    type="datetime-local"
                    value={schedulingDates.get(network.id)?.slice(0, 16)}
                    onChange={(e) => onScheduleDateChange(network.id, e.target.value)}
                    size="sm"
                    width="auto"
                    bg={inputBg}
                    borderColor={borderColor}
                    color={textColor}
                    fontSize="sm"
                  />
                )}
              </HStack>
            ))}
          </VStack>

          {/* Ovládací tlačítka */}
          {getLinkedNetworks().length > 0 && (
            <HStack spacing={4}>
              <Button
                colorScheme="blue"
                onClick={onUseForAll}
                isDisabled={!getLinkedNetworks().some(network => canScheduleOnNetwork(network.id))}
                size={{ base: 'sm', md: 'md' }}
              >
                Použít pro všechny
              </Button>
              <Button
                colorScheme="green"
                onClick={onSaveScheduling}
                isDisabled={isSaving}
                isLoading={isSaving}
                size={{ base: 'sm', md: 'md' }}
              >
                Uložit plánování
              </Button>
            </HStack>
          )}
        </>
      )}

      {/* Zobrazení odeslaných sítí */}
      {sentNetworks.size > 0 && (
        <Box
          p={4}
          borderWidth="1px"
          borderRadius="md"
          borderColor={useColorModeValue('blue.200', 'blue.600')}
          bg={useColorModeValue('blue.50', 'blue.900')}
        >
          <Text fontSize="sm" color={useColorModeValue('blue.800', 'blue.200')}>
            Příspěvek byl již odeslán na následující sítě (nelze již plánovat):
          </Text>
          <VStack spacing={2} align="stretch" mt={2}>
            {Array.from(sentNetworks).map((networkId) => (
              <HStack key={networkId} justify="space-between">
                <Text fontSize="sm" color={textColor}>
                  {availableNetworks.find(network => network.id === networkId)?.networkName || 'Neznámá síť'}
                </Text>
                <Text fontSize="xs" color={useColorModeValue('blue.600', 'blue.300')}>
                  Odesláno ✓
                </Text>
              </HStack>
            ))}
          </VStack>
        </Box>
      )}
    </VStack>
  );
};
