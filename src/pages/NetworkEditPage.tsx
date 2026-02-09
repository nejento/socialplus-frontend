import { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useColorModeValue,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  HStack,
  Card,
  CardBody,
  Divider,
  IconButton,
  SimpleGrid,
  useDisclosure,
  Badge,
  FormErrorMessage,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router';
import { ArrowBackIcon, AddIcon, CheckIcon, CloseIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { useForm } from 'react-hook-form';
import { networkAPI, userAPI } from '../services/api';
import { OwnedNetwork, NetworkToken, NetworkPermission, NetworkType } from '@/types';
import NetworkTokenModal from '../components/NetworkTokenModal';
import ConfirmationModal from '../components/ConfirmationModal';
import UserPermissionModal from '../components/UserPermissionModal';
import DeleteNetworkModal from '../components/DeleteNetworkModal';

interface NetworkForm {
  networkName: string;
  note: string;
}

// Network type configurations
const NETWORK_TYPES: {
  type: NetworkType;
  displayName: string;
  color: string;
  description: string;
}[] = [
  { type: 'facebook', displayName: 'Facebook', color: 'blue', description: 'Facebook stránky a profily' },
  { type: 'twitter', displayName: 'Twitter (X)', color: 'twitter', description: 'Twitter/X účty' },
  { type: 'mastodon', displayName: 'Mastodon', color: 'purple', description: 'Mastodon instance' },
  { type: 'bluesky', displayName: 'Bluesky', color: 'cyan', description: 'Bluesky profily' },
  { type: 'threads', displayName: 'Threads', color: 'green', description: 'Meta Threads profily' },
];

interface UserPermissionForm {
  username: string;
  permission: 'read' | 'write';
}

const TokenCard: React.FC<{
  token: NetworkToken;
}> = ({ token }) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Card
      bg={cardBg}
      borderColor={borderColor}
      borderWidth="1px"
      size="sm"
    >
      <CardBody>
        <Text fontWeight="medium" fontSize="sm" textAlign="center">
          {token.tokenName}
        </Text>
      </CardBody>
    </Card>
  );
};

const NetworkEditPage = () => {
  const { networkId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const isEditMode = !!networkId;

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [networkData, setNetworkData] = useState<OwnedNetwork | null>(null);
  const [tokens, setTokens] = useState<NetworkToken[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(false);

  // Network type selection for new networks
  const [selectedNetworkType, setSelectedNetworkType] = useState<NetworkType | null>(null);

  // Permissions states
  const [permissions, setPermissions] = useState<NetworkPermission[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);

  // Modal states
  const { isOpen: isTokenModalOpen, onOpen: onTokenModalOpen, onClose: onTokenModalClose } = useDisclosure();
  const { isOpen: isUserModalOpen, onOpen: onUserModalOpen, onClose: onUserModalClose } = useDisclosure();
  const { isOpen: isDeleteAllTokensModalOpen, onOpen: onDeleteAllTokensModalOpen, onClose: onDeleteAllTokensModalClose } = useDisclosure();
  const [editingPermission, setEditingPermission] = useState<NetworkPermission | null>(null);
  const { isOpen: isDeleteNetworkModalOpen, onOpen: onDeleteNetworkModalOpen, onClose: onDeleteNetworkModalClose } = useDisclosure();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset
  } = useForm<NetworkForm>({
    defaultValues: {
      networkName: '',
      note: ''
    }
  });

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const selectedBg = useColorModeValue('blue.50', 'blue.900');
  const selectedBorder = useColorModeValue('blue.500', 'blue.300');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  useEffect(() => {
    if (isEditMode && networkId) {
      loadNetworkData();
      loadTokens();
      loadPermissions();
    }
  }, [networkId, isEditMode]);

  const loadNetworkData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await networkAPI.getNetwork(parseInt(networkId!));
      const data: OwnedNetwork = response.data;

      setNetworkData(data);
      reset({
        networkName: data.networkName,
        note: data.note
      });

    } catch (error) {
      console.error('Chyba při načítání dat sítě:', error);
      setError('Nepodařilo se načíst data sociální sítě');
    } finally {
      setLoading(false);
    }
  };

  const loadTokens = async () => {
    if (!networkId) return;

    try {
      setLoadingTokens(true);
      const response = await networkAPI.getNetworkTokens(parseInt(networkId));
      setTokens(response.data);
    } catch (error) {
      console.error('Chyba při načítání tokenů:', error);
      toast({
        title: 'Chyba při načítání tokenů',
        description: 'Nepodařilo se načíst autentizační tokeny',
        status: 'error',
        duration: 3000, 
      });
    } finally {
      setLoadingTokens(false);
    }
  };

  const loadPermissions = async () => {
    if (!networkId) return;

    try {
      setLoadingPermissions(true);
      const response = await networkAPI.getNetworkPermissions(parseInt(networkId));
      const permissionsData = response.data;

      // Načteme informace o uživatelích pro každé oprávnění
      const permissionsWithUsers = await Promise.all(
        permissionsData.map(async (permission: NetworkPermission) => {
          try {
            const userResponse = await userAPI.getUserProfile(permission.granteeId);
            return {
              ...permission,
              user: userResponse.data
            };
          } catch (error) {
            console.error(`Chyba při načítání profilu uživatele ${permission.granteeId}:`, error);
            // Fallback - pokud se nepodaří načíst profil uživatele
            return {
              ...permission,
              user: {
                id: permission.granteeId,
                username: `user_${permission.granteeId}`,
                displayname: `Uživatel ${permission.granteeId}`
              }
            };
          }
        })
      );

      setPermissions(permissionsWithUsers);
    } catch (error) {
      console.error('Chyba při načítání oprávnění:', error);
      toast({
        title: 'Chyba při načítání oprávnění',
        description: 'Nepodařilo se načíst oprávnění uživatelů',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoadingPermissions(false);
    }
  };

  const onSubmit = async (formData: NetworkForm) => {
    try {
      setSaving(true);

      if (isEditMode) {
        if (!networkData) {
          setError('Data sítě nejsou načtena');
          setSaving(false);
          return;
        }

        // Pouze networkName a networkNote - networkType nelze měnit
        await networkAPI.updateNetwork(parseInt(networkId!), {
          networkName: formData.networkName,
          networkNote: formData.note
        });
      } else {
        if (!selectedNetworkType) {
          setError('Vyberte typ sociální sítě');
          setSaving(false);
          return;
        }

        const response = await networkAPI.createNetwork({
          networkType: selectedNetworkType,
          networkName: formData.networkName,
          networkNote: formData.note
        });

        toast({
          title: 'Síť vytvořena',
          description: 'Nová sociální síť byla úspěšně vytvořena',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        navigate(`/networks/edit/${response.data.networkId}`);
        return;
      }

      toast({
        title: 'Síť aktualizována',
        description: 'Nastavení sociální sítě bylo úspěšně aktualizováno',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      reset({
        networkName: formData.networkName,
        note: formData.note
      });

    } catch (error) {
      console.error('Chyba při ukládání:', error);
      toast({
        title: 'Chyba při ukládání',
        description: isEditMode
          ? 'Nepodařilo se aktualizovat nastavení sítě'
          : 'Nepodařilo se vytvořit novou síť',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  // Funkce pro přidání tokenů podle typu sítě
  const handleAddTokens = async (tokenData: any) => {
    if (!networkId) return;

    try {
      setSaving(true);
      await networkAPI.addNetworkToken(parseInt(networkId), tokenData);

      const networkTypeInfo = getNetworkTypeInfo(networkData?.networkType!);
      toast({
        title: `${networkTypeInfo?.displayName} tokeny přidány`,
        description: 'Tokeny byly úspěšně přidány a nakonfigurovány',
        status: 'success',
        duration: 3000,
      });

      loadTokens();

    } catch (error) {
      console.error('Chyba při přidávání tokenů:', error);
      toast({
        title: 'Chyba při přidávání tokenů',
        description: 'Nepodařilo se přidat autentizační tokeny',
        status: 'error',
        duration: 3000,
      });
      throw error; // Re-throw to prevent modal from closing
    } finally {
      setSaving(false);
    }
  };

  // Funkce pro odstranění všech tokenů s potvrzením
  const handleRemoveAllTokens = () => {
    if (tokens.length === 0) {
      toast({
        title: 'Žádné tokeny k odstranění',
        description: 'Nejsou nastaveny žádné autentizační tokeny',
        status: 'info',
        duration: 2000,
      });
      return;
    }
    onDeleteAllTokensModalOpen();
  };

  const confirmDeleteAllTokens = async () => {
    if (!networkId || tokens.length === 0) return;

    try {
      setSaving(true);

      // Odstraníme všechny tokeny jedním voláním
      await networkAPI.removeNetworkToken(parseInt(networkId));

      toast({
        title: 'Všechny tokeny odstraněny',
        description: `Úspěšně odstraněno ${tokens.length} ${tokens.length === 1 ? 'token' : tokens.length < 5 ? 'tokeny' : 'tokenů'}`,
        status: 'success',
        duration: 3000,
      });

      onDeleteAllTokensModalClose();
      loadTokens(); // Refresh tokenů

    } catch (error) {
      console.error('Chyba při odstraňování tokenů:', error);
      toast({
        title: 'Chyba při odstraňování tokenů',
        description: 'Nepodařilo se odstranit všechny autentizační tokeny',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEditPermission = (permission: NetworkPermission) => {
    setEditingPermission(permission);
    onUserModalOpen();
  };

  const handleAddPermission = () => {
    setEditingPermission(null);
    onUserModalOpen();
  };

  const onSubmitPermission = async (formData: UserPermissionForm) => {
    if (!networkId) return;

    try {
      const userResponse = await userAPI.getUserByUsername(formData.username);
      const userData = userResponse.data;

      if (editingPermission) {
        await networkAPI.changeNetworkPermission(parseInt(networkId), {
          granteeId: userData.id,
          permission: formData.permission
        });
        toast({
          title: 'Oprávnění aktualizováno',
          status: 'success',
          duration: 2000,
        });
      } else {
        await networkAPI.addNetworkPermission(parseInt(networkId), {
          granteeId: userData.id,
          permission: formData.permission
        });
        toast({
          title: 'Oprávnění přidáno',
          status: 'success',
          duration: 2000,
        });
      }

      onUserModalClose();
      loadPermissions();

    } catch (error: any) {
      console.error('Chyba při ukládání oprávnění:', error);
      
      if (error.response?.status === 404) {
        toast({
          title: 'Uživatel nenalezen',
          description: 'Uživatel s tímto jménem neexistuje',
          status: 'error',
          duration: 3000,
        });
      } else {
        toast({
          title: 'Chyba při ukládání oprávnění',
          description: error.response?.data?.message || 'Nepodařilo se uložit oprávnění',
          status: 'error',
          duration: 3000,
        });
      }
    }
  };

  const handleRemovePermission = async (granteeId: number) => {
    if (!networkId) return;

    if (!confirm('Opravdu chcete odstranit toto oprávnění?')) return;

    try {
      await networkAPI.removeNetworkPermission(parseInt(networkId), granteeId);
      toast({
        title: 'Oprávnění odstraněno',
        status: 'success',
        duration: 2000,
      });
      loadPermissions();
    } catch (error) {
      console.error('Chyba při odstraňování oprávnění:', error);
      toast({
        title: 'Chyba při odstraňování oprávnění',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      if (confirm('Máte neuložené změny. Opravdu chcete stránku opustit?')) {
        navigate('/networks');
      }
    } else {
      navigate('/networks');
    }
  };

  const getNetworkTypeInfo = (type: NetworkType) => {
    return NETWORK_TYPES.find(nt => nt.type === type);
  };

  // Show loading state
  if (loading) {
    return (
      <Box p={4} display="flex" justifyContent="center" alignItems="center" minH="50vh">
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Načítám data sítě...</Text>
        </VStack>
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box p={4}>
        <Alert status="error" borderRadius="md" mb={4}>
          <AlertIcon />
          <VStack align="start" spacing={2} flex={1}>
            <Text fontWeight="bold">Chyba při načítání</Text>
            <Text fontSize="sm">{error}</Text>
          </VStack>
        </Alert>
        <Button onClick={() => navigate('/networks')} leftIcon={<ArrowBackIcon />}>
          Zpět na přehled sítí
        </Button>
      </Box>
    );
  }

  return (
    <Box
      minH="100vh"
      bg={useColorModeValue('gray.50', 'gray.900')}
      w="100%"
      maxW="100vw"
      overflow="hidden"
    >
      <Box
        maxW={{ base: "100%", lg: "1400px" }}
        mx="auto"
        w="100%"
      >
        <VStack spacing={8} align="stretch" w="100%" px={{ base: 0, md: 0 }}>
          {/* Header */}
          <Box bg={useColorModeValue('white', 'gray.800')} p={{ base: 4, md: 6 }} borderRadius="lg" shadow="sm" w="100%" overflow="hidden">
            <VStack spacing={4} align="stretch" w="100%">
              <VStack
                spacing={3}
                align="stretch"
                w="100%"
                display={{ base: "flex", md: "none" }}
              >
                <Button
                  leftIcon={<ArrowBackIcon />}
                  onClick={handleCancel}
                  size="md"
                  variant="outline"
                  w="100%"
                >
                  Zpět na přehled sítí
                </Button>
                {isEditMode && (
                  <Button
                    leftIcon={<DeleteIcon />}
                    onClick={onDeleteNetworkModalOpen}
                    size="md"
                    colorScheme="red"
                    variant="outline"
                    w="100%"
                  >
                    Odstranit síť
                  </Button>
                )}
                <Heading size="lg" wordBreak="break-word">
                  {isEditMode ? 'Upravit síť' : 'Vytvořit novou síť'}
                </Heading>
                <Text
                  color={useColorModeValue('gray.600', 'gray.400')}
                  fontSize="md"
                  wordBreak="break-word"
                >
                  {isEditMode
                    ? 'Upravte nastavení a konfiguraci sociální sítě'
                    : 'Vytvořte novou sociální síť pro správu příspěvků'
                  }
                </Text>
              </VStack>

              <HStack
                justifyContent="space-between"
                align="center"
                w="100%"
                display={{ base: "none", md: "flex" }}
                flexWrap="wrap"
                gap={4}
              >
                <VStack align="start" spacing={2}>
                  <Heading size="xl" wordBreak="break-word">
                    {isEditMode ? 'Upravit síť' : 'Vytvořit novou síť'}
                  </Heading>
                  <Text
                    color={useColorModeValue('gray.600', 'gray.400')}
                    fontSize="lg"
                    wordBreak="break-word"
                  >
                    {isEditMode
                      ? 'Upravte nastavení a konfiguraci sociální sítě'
                      : 'Vytvořte novou sociální síť pro správu příspěvků'
                    }
                  </Text>
                </VStack>

                <HStack spacing={3} flexWrap="wrap">
                  <Button
                    leftIcon={<ArrowBackIcon />}
                    onClick={handleCancel}
                    size="lg"
                    variant="outline"
                  >
                    Zpět na přehled sítí
                  </Button>
                  {isEditMode && (
                    <IconButton
                      icon={<DeleteIcon />}
                      onClick={onDeleteNetworkModalOpen}
                      aria-label="Odstranit síť"
                      size="lg"
                      colorScheme="red"
                      variant="outline"
                    />
                  )}
                </HStack>
              </HStack>
            </VStack>
          </Box>

          {/* Main Content */}
          <Card borderWidth="1px" borderRadius="lg" overflow="hidden" shadow="sm">
            <CardBody>
              <VStack spacing={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel>Název sítě</FormLabel>
                  <Input
                    {...register('networkName', {
                      required: 'Zadejte prosím název sítě',
                      minLength: {
                        value: 3,
                        message: 'Název sítě musí mít alespoň 3 znaky'
                      }
                    })}
                    placeholder="Např. Oficiální Facebook stránka"
                    isInvalid={!!errors.networkName}
                  />
                  <FormErrorMessage>
                    {errors.networkName && errors.networkName.message}
                  </FormErrorMessage>
                </FormControl>

                <FormControl>
                  <FormLabel>Popis (poznámka)</FormLabel>
                  <Textarea
                    {...register('note')}
                    placeholder="Krátký popis nebo poznámka k síti"
                    resize="none"
                  />
                </FormControl>

                <Divider />

                {/* Network Type Selection - only for new networks */}
                {!isEditMode && (
                  <VStack spacing={4} align="stretch">
                    <Heading size="md">Vyberte typ sociální sítě</Heading>

                    <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                      Zvolte typ sociální sítě, kterou chcete spravovat
                    </Text>

                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                      {NETWORK_TYPES.map((network) => (
                        <Box
                          key={network.type}
                          as="button"
                          type="button"
                          p={4}
                          borderWidth="2px"
                          borderRadius="lg"
                          borderColor={selectedNetworkType === network.type ? selectedBorder : borderColor}
                          bg={selectedNetworkType === network.type ? selectedBg : 'transparent'}
                          cursor="pointer"
                          transition="all 0.2s"
                          _hover={{
                            bg: selectedNetworkType === network.type ? selectedBg : hoverBg,
                            borderColor: selectedNetworkType === network.type ? selectedBorder : 'gray.300',
                          }}
                          onClick={() => setSelectedNetworkType(network.type)}
                          textAlign="left"
                        >
                          <VStack align="start" spacing={3}>
                            <HStack>
                              <Badge colorScheme={network.color} variant="solid" px={2} py={1}>
                                {network.displayName}
                              </Badge>
                              {selectedNetworkType === network.type && (
                                <CheckIcon color={`${network.color}.500`} boxSize={4} />
                              )}
                            </HStack>
                            <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                              {network.description}
                            </Text>
                          </VStack>
                        </Box>
                      ))}
                    </SimpleGrid>

                    {!selectedNetworkType && (
                      <Alert status="info" borderRadius="md">
                        <AlertIcon />
                        <Text fontSize="sm">
                          Vyberte typ sociální sítě pro pokračování
                        </Text>
                      </Alert>
                    )}
                  </VStack>
                )}

                <Divider />

                <HStack width="full" justify="space-between">
                  <Button
                    colorScheme="blue"
                    onClick={handleSubmit(onSubmit)}
                    isLoading={saving}
                    loadingText={isEditMode ? 'Ukládání...' : 'Vytváření...'}
                    size="lg"
                    width="full"
                    isDisabled={!isEditMode && !selectedNetworkType}
                  >
                    {isEditMode ? 'Uložit změny' : 'Vytvořit síť'}
                  </Button>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          <VStack spacing={4} align="stretch">
            {/* Tokens Section - pouze v edit mode */}
            {isEditMode && (
              <Card
                bg={bgColor}
                borderColor={borderColor}
                borderWidth="1px"
                shadow="md"
              >
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Heading size="md">Autentizační tokeny</Heading>

                    <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                      Spravujte API tokeny pro komunikaci se sociálními sítěmi
                    </Text>

                    {/* Conditional buttons based on token state */}
                    {tokens.length === 0 ? (
                      // Show only Add button when no tokens exist
                      <Button
                        leftIcon={<AddIcon />}
                        colorScheme="green"
                        size={{ base: 'sm', md: 'md' }}
                        onClick={onTokenModalOpen}
                        width={{ base: 'full', md: 'auto' }}
                      >
                        Přidat tokeny pro {getNetworkTypeInfo(networkData?.networkType!)?.displayName}
                      </Button>
                    ) : (
                      // Show only Remove button when tokens exist
                      <Button
                        leftIcon={<CloseIcon />}
                        colorScheme="red"
                        size={{ base: 'sm', md: 'md' }}
                        onClick={handleRemoveAllTokens}
                        width={{ base: 'full', md: 'auto' }}
                      >
                        Odstranit všechny tokeny
                      </Button>
                    )}

                    {loadingTokens ? (
                      <Box display="flex" justifyContent="center" py={4}>
                        <Spinner />
                      </Box>
                    ) : tokens.length === 0 ? (
                      <Box
                        textAlign="center"
                        py={8}
                        borderWidth="1px"
                        borderRadius="lg"
                        borderStyle="dashed"
                        borderColor={useColorModeValue('gray.300', 'gray.600')}
                      >
                        <VStack spacing={3}>
                          <Text fontSize="md" fontWeight="medium">
                            Zatím nejsou nastaveny žádné tokeny
                          </Text>
                          <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                            Přidejte autentizační tokeny pro komunikaci s API sociálních sítí
                          </Text>
                        </VStack>
                      </Box>
                    ) : (
                      <VStack spacing={3} align="stretch">
                        <Text fontSize="sm" fontWeight="medium">
                          Nakonfigurované tokeny:
                        </Text>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          {tokens.map((token, index) => (
                            <TokenCard
                              key={`${token.tokenName}-${index}`}
                              token={token}
                            />
                          ))}
                        </SimpleGrid>
                      </VStack>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            )}

            {/* User Permissions Section - pouze v edit mode */}
            {isEditMode && (
              <Card
                bg={bgColor}
                borderColor={borderColor}
                borderWidth="1px"
                shadow="md"
              >
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Heading size="md">Uživatelská oprávnění</Heading>

                    <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                      Spravujte oprávnění uživatelů pro tuto sociální síť
                    </Text>

                    <Button
                      leftIcon={<AddIcon />}
                      colorScheme="green"
                      size={{ base: 'sm', md: 'md' }}
                      onClick={handleAddPermission}
                      width={{ base: 'full', md: 'auto' }}
                    >
                      Přidat uživatele
                    </Button>

                    {loadingPermissions ? (
                      <Box display="flex" justifyContent="center" py={4}>
                        <Spinner />
                      </Box>
                    ) : permissions.length === 0 ? (
                      <Box
                        textAlign="center"
                        py={8}
                        borderWidth="1px"
                        borderRadius="lg"
                        borderStyle="dashed"
                        borderColor={useColorModeValue('gray.300', 'gray.600')}
                      >
                        <VStack spacing={3}>
                          <Text fontSize="md" fontWeight="medium">
                            Zatím nejsou nastavena žádná oprávnění
                          </Text>
                          <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                            Přidejte uživatelská oprávnění pro tuto sociální síť
                          </Text>
                        </VStack>
                      </Box>
                    ) : (
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        {permissions.map((permission, index) => (
                          <Card
                            key={`${permission.user?.username}-${index}`}
                            bg={bgColor}
                            borderColor={borderColor}
                            borderWidth="1px"
                            shadow="md"
                          >
                            <CardBody>
                              <VStack spacing={3} align="stretch">
                                <HStack justify="space-between" width="100%">
                                  <VStack align="start" spacing={1} flex={1}>
                                    <Text fontWeight="bold" fontSize="sm" isTruncated>
                                      {permission.user?.displayname || 'Neznámý uživatel'}
                                    </Text>
                                    <Text fontSize="xs" color={useColorModeValue('gray.600', 'gray.400')} isTruncated>
                                      @{permission.user?.username || 'unknown'}
                                    </Text>
                                  </VStack>
                                  <HStack spacing={1}>
                                    <IconButton
                                      aria-label="Upravit oprávnění"
                                      icon={<EditIcon />}
                                      size="xs"
                                      variant="ghost"
                                      onClick={() => handleEditPermission(permission)}
                                    />
                                    <IconButton
                                      aria-label="Odstranit oprávnění"
                                      icon={<CloseIcon />}
                                      size="xs"
                                      variant="ghost"
                                      colorScheme="red"
                                      onClick={() => handleRemovePermission(permission.granteeId)}
                                    />
                                  </HStack>
                                </HStack>

                                <HStack>
                                  <Text fontWeight="medium" fontSize="sm">Oprávnění:</Text>
                                  <Badge
                                    colorScheme={permission.permission === 'write' ? 'green' : 'blue'}
                                    fontSize="xs"
                                    px={2}
                                    py={1}
                                    borderRadius="md"
                                  >
                                    {permission.permission === 'write' ? 'Úplný přístup' : 'Pouze čtení'}
                                  </Badge>
                                </HStack>
                              </VStack>
                            </CardBody>
                          </Card>
                        ))}
                      </SimpleGrid>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            )}
          </VStack>

          {/* NetworkTokenModal - uses the new universal modal component */}
          {networkData && (
            <NetworkTokenModal
              isOpen={isTokenModalOpen}
              onClose={onTokenModalClose}
              networkType={networkData.networkType}
              onSubmit={handleAddTokens}
              isLoading={saving}
            />
          )}

          {/* UserPermissionModal - uses the new user permission modal component */}
          <UserPermissionModal
            isOpen={isUserModalOpen}
            onClose={onUserModalClose}
            onSubmit={onSubmitPermission}
            isLoading={saving}
            editingPermission={editingPermission}
          />

          {/* Delete All Tokens Confirmation Modal */}
          <ConfirmationModal
            isOpen={isDeleteAllTokensModalOpen}
            onClose={onDeleteAllTokensModalClose}
            title="Odstranit všechny tokeny"
            message={`Opravdu chcete odstranit všechny tokeny (${tokens.length})? Tato akce je nevratná.`}
            confirmText="Ano, odstranit"
            onConfirm={confirmDeleteAllTokens}
            isLoading={saving}
            colorScheme="red"
          />

          {/* Delete Network Confirmation Modal */}
          <DeleteNetworkModal
            isOpen={isDeleteNetworkModalOpen}
            onClose={onDeleteNetworkModalClose}
            networkName={networkData?.networkName || ''}
            onConfirm={async () => {
              if (!networkId) return;

              try {
                setSaving(true);
                await networkAPI.deleteNetwork(parseInt(networkId));

                toast({
                  title: 'Síť odstraněna',
                  description: 'Sociální síť byla úspěšně odstraněna',
                  status: 'success',
                  duration: 3000,
                });

                navigate('/networks');
              } catch (error: any) {
                console.error('Chyba při odstraňování sítě:', error);

                // Specifická chybová zpráva pro případ, kdy jsou na síť připojené příspěvky
                const errorMessage = error.response?.status === 400 || error.response?.status === 409
                  ? 'Síť se nepovedlo odstranit, je možné, že jsou na ni připojené příspěvky.'
                  : 'Nepodařilo se odstranit sociální síť.';

                toast({
                  title: 'Chyba při odstraňování sítě',
                  description: errorMessage,
                  status: 'error',
                  duration: 5000,
                  isClosable: true,
                });
              } finally {
                setSaving(false);
              }
            }}
            isDeleting={saving}
          />
        </VStack>
      </Box>
    </Box>
  );
};

export default NetworkEditPage;

