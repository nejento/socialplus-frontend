import React from 'react';
import {
  VStack,
  Text,
  Box,
  HStack,
  CheckboxRoot,
  CheckboxControl,
  CheckboxLabel,
  CheckboxHiddenInput,
  CheckboxIndicator,
  Input,
  Button
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
  return (
    <VStack align="stretch" gap={4}>
      <Text fontSize="lg" fontWeight="semibold" color={{ base: 'gray.800', _dark: 'white' }}>
        Plánování příspěvku
      </Text>

      {/* Zobrazení existujících plánů */}
      {existingSchedules.size > 0 && (
        <Box
          p={4}
          borderWidth="1px"
          borderRadius="md"
          borderColor={{ base: 'green.200', _dark: 'green.600' }}
          bg={{ base: 'green.50', _dark: 'green.900' }}
        >
          <Text fontSize="sm" color={{ base: 'green.800', _dark: 'green.200' }}>
            Tento příspěvek je již naplánován na následující sítě:
          </Text>
          <VStack gap={2} align="stretch" mt={2}>
            {Array.from(existingSchedules.entries()).map(([networkId, postDate]) => (
              <HStack key={networkId} justify="space-between">
                <Text fontSize="sm" color={{ base: 'gray.800', _dark: 'white' }}>
                  {availableNetworks.find(network => network.id === networkId)?.networkName || 'Neznámá síť'}
                </Text>
                <Text fontSize="sm" color={{ base: 'gray.800', _dark: 'white' }}>
                  {new Date(postDate).toLocaleString()}
                </Text>
              </HStack>
            ))}
          </VStack>
        </Box>
      )}

      {/* Kontrola oprávnění */}
      {!canManageScheduling && existingSchedules.size === 0 && (
        <Text fontSize="sm" color={{ base: 'gray.600', _dark: 'gray.400' }} fontStyle="italic">
          Tento příspěvek není naplánován na žádné sociální síti.
        </Text>
      )}

      {/* Ovládací prvky pro plánování */}
      {canManageScheduling && (
        <>
          <VStack gap={4} align="stretch">
            <Text fontSize="sm" color={{ base: 'gray.800', _dark: 'white' }}>
              {getLinkedNetworks().length > 0
                ? "Vyberte datum a čas pro plánování příspěvku na jednotlivých sítích:"
                : "Nejprve připojte příspěvek k sociálním sítím, abyste mohli nastavit plánování."
              }
            </Text>
            {getLinkedNetworks().map(network => (
              <HStack key={network.id} gap={4} align="start" width="100%">
                <CheckboxRoot
                  checked={schedulingDates.has(network.id)}
                  onCheckedChange={(details) => {
                    if (details.checked) {
                      const defaultDate = new Date(Date.now() + 60 * 60 * 1000).toISOString();
                      onScheduleDateChange(network.id, defaultDate);
                    } else {
                      onScheduleDateChange(network.id, '');
                    }
                  }}
                  colorPalette="blue"
                  disabled={!canScheduleOnNetwork(network.id)}
                >
                  <CheckboxHiddenInput />
                  <CheckboxControl>
                    <CheckboxIndicator />
                  </CheckboxControl>
                  <CheckboxLabel>
                    <Text fontSize="sm" fontWeight="medium">
                      {network.networkName}
                      {sentNetworks.has(network.id) && (
                        <Text as="span" fontSize="xs" color={{ base: "gray.500", _dark: "gray.400" }} ml={2}>
                          (odesláno)
                        </Text>
                      )}
                      {!canScheduleOnNetwork(network.id) && !sentNetworks.has(network.id) && (
                        <Text as="span" fontSize="xs" color={{ base: "gray.500", _dark: "gray.400" }} ml={2}>
                          (nemáte oprávnění)
                        </Text>
                      )}
                    </Text>
                  </CheckboxLabel>
                </CheckboxRoot>
                {schedulingDates.has(network.id) && canScheduleOnNetwork(network.id) && (
                  <Input
                    type="datetime-local"
                    value={schedulingDates.get(network.id)?.slice(0, 16) || ''}
                    onChange={(e) => onScheduleDateChange(network.id, e.target.value)}
                    size="sm"
                    width="auto"
                    bg={{ base: 'white', _dark: 'gray.700' }}
                    borderColor={{ base: 'gray.200', _dark: 'gray.600' }}
                    color={{ base: 'gray.800', _dark: 'white' }}
                    fontSize="sm"
                    css={{
                      "&::-webkit-calendar-picker-indicator": {
                        filter: { base: "none", _dark: "invert(1)" }
                      }
                    }}
                  />
                )}
              </HStack>
            ))}
          </VStack>

          {/* Ovládací tlačítka */}
          {getLinkedNetworks().length > 0 && (
            <HStack gap={4}>
              <Button
                colorPalette="blue"
                onClick={onUseForAll}
                disabled={!getLinkedNetworks().some(network => canScheduleOnNetwork(network.id))}
                size={{ base: 'sm', md: 'md' }}
              >
                Použít pro všechny
              </Button>
              <Button
                colorPalette="green"
                onClick={onSaveScheduling}
                disabled={isSaving}
                loading={isSaving}
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
          borderColor={{ base: 'blue.200', _dark: 'blue.600' }}
          bg={{ base: 'blue.50', _dark: 'blue.900' }}
        >
          <Text fontSize="sm" color={{ base: 'blue.800', _dark: 'blue.200' }}>
            Příspěvek byl již odeslán na následující sítě (nelze již plánovat):
          </Text>
          <VStack gap={2} align="stretch" mt={2}>
            {Array.from(sentNetworks).map((networkId) => (
              <HStack key={networkId} justify="space-between">
                <Text fontSize="sm" color={{ base: 'gray.800', _dark: 'white' }}>
                  {availableNetworks.find(network => network.id === networkId)?.networkName || 'Neznámá síť'}
                </Text>
                <Text fontSize="xs" color={{ base: 'blue.600', _dark: 'blue.300' }}>
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

export default SchedulingSection;
