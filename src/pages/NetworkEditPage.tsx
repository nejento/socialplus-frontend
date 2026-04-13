import { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Input,
  Textarea,
  Spinner,
  HStack,
  IconButton,
  SimpleGrid,
  Badge,
  Field,
  Icon
} from '@chakra-ui/react';
import { MdCheck, MdClose, MdEdit, MdDelete } from 'react-icons/md';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router';
import { networkAPI, userAPI } from '../services/api';
import { OwnedNetwork, NetworkToken, NetworkPermission, NetworkType } from '@/types';
import NetworkTokenModal from '../components/NetworkTokenModal';
import ConfirmationModal from '../components/ConfirmationModal';
import UserPermissionModal from '../components/UserPermissionModal';
import DeleteNetworkModal from '../components/DeleteNetworkModal';
import { toaster } from '../components/ui/toaster';

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

const Token: React.FC<{
  token: NetworkToken;
}> = ({ token }) => {
  return (
    <Box
      bg={{ base: "white", _dark: "gray.700" }}
      borderColor={{ base: "gray.200", _dark: "gray.600" }}
      borderWidth="1px"
      borderRadius="md"
      p={3}
    >
      <Text fontWeight="medium" fontSize="sm" textAlign="center">
        {token.tokenName}
      </Text>
    </Box>
  );
};

const NetworkEditPage = () => {
  const { networkId } = useParams();
  const navigate = useNavigate();
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
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isDeleteAllTokensModalOpen, setIsDeleteAllTokensModalOpen] = useState(false);
  const [isDeleteNetworkModalOpen, setIsDeleteNetworkModalOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<NetworkPermission | null>(null);

  const onTokenModalOpen = () => setIsTokenModalOpen(true);
  const onTokenModalClose = () => setIsTokenModalOpen(false);
  const onUserModalOpen = () => setIsUserModalOpen(true);
  const onUserModalClose = () => {
    setIsUserModalOpen(false);
    setEditingPermission(null);
  };
  const onDeleteAllTokensModalOpen = () => setIsDeleteAllTokensModalOpen(true);
  const onDeleteAllTokensModalClose = () => setIsDeleteAllTokensModalOpen(false);
  const onDeleteNetworkModalOpen = () => setIsDeleteNetworkModalOpen(true);
  const onDeleteNetworkModalClose = () => setIsDeleteNetworkModalOpen(false);

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
      toaster.create({
        title: 'Chyba při načítání tokenů',
        description: 'Nepodařilo se načíst tokeny',
        type: 'error'
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
      toaster.create({
        title: 'Chyba při načítání oprávnění',
        description: 'Nepodařilo se načíst oprávnění',
        type: 'error'
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

        toaster.create({
          title: 'Síť vytvořena',
          description: 'Sociální síť byla úspěšně vytvořena',
          type: 'success'
        });

        navigate(`/networks/edit/${response.data.networkId}`);
        return;
      }

      toaster.create({
        title: 'Změny uloženy',
        description: 'Nastavení sítě bylo úspěšně aktualizováno',
        type: 'success'
      });

      reset({
        networkName: formData.networkName,
        note: formData.note
      });

    } catch (error) {
      console.error('Chyba při ukládání:', error);
      toaster.create({
        title: 'Chyba při ukládání',
        description: 'Nepodařilo se uložit nastavení sítě',
        type: 'error'
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
      toaster.create({
        title: 'Tokeny přidány',
        description: `Tokeny pro ${networkTypeInfo?.displayName} byly úspěšně přidány`,
        type: 'success'
      });

      loadTokens();

    } catch (error) {
      console.error('Chyba při přidávání tokenů:', error);
      toaster.create({
        title: 'Chyba při přidávání tokenů',
        description: 'Nepodařilo se přidat tokeny',
        type: 'error'
      });
      throw error; // Re-throw to prevent modal from closing
    } finally {
      setSaving(false);
    }
  };

  // Funkce pro odstranění všech tokenů s potvrzením
  const handleRemoveAllTokens = () => {
    if (tokens.length === 0) {
      toaster.create({
        title: 'Žádné tokeny',
        description: 'Nejsou k dispozici žádné tokeny k odstranění',
        type: 'info'
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

      toaster.create({
        title: 'Tokeny odstraněny',
        description: 'Všechny tokeny byly úspěšně odstraněny',
        type: 'success'
      });

      onDeleteAllTokensModalClose();
      loadTokens(); // Refresh tokenů

    } catch (error) {
      console.error('Chyba při odstraňování tokenů:', error);
      toaster.create({
        title: 'Chyba při odstraňování tokenů',
        description: 'Nepodařilo se odstranit tokeny',
        type: 'error'
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
        toaster.create({
          title: 'Oprávnění upraveno',
          description: 'Oprávnění bylo úspěšně aktualizováno',
          type: 'success'
        });
      } else {
        await networkAPI.addNetworkPermission(parseInt(networkId), {
          granteeId: userData.id,
          permission: formData.permission
        });
        toaster.create({
          title: 'Oprávnění přidáno',
          description: 'Uživatelské oprávnění bylo úspěšně přidáno',
          type: 'success'
        });
      }

      onUserModalClose();
      loadPermissions();

    } catch (error: any) {
      console.error('Chyba při ukládání oprávnění:', error);
      
      if (error.response?.status === 404) {
        toaster.create({
          title: 'Uživatel nenalezen',
          description: 'Zadané uživatelské jméno nebylo nalezeno',
          type: 'error'
        });
      } else {
        toaster.create({
          title: 'Chyba při ukládání oprávnění',
          description: 'Nepodařilo se uložit uživatelské oprávnění',
          type: 'error'
        });
      }
    }
  };

  const handleRemovePermission = async (granteeId: number) => {
    if (!networkId) return;

    if (!confirm('Opravdu chcete odstranit toto oprávnění?')) return;

    try {
      await networkAPI.removeNetworkPermission(parseInt(networkId), granteeId);
      toaster.create({
        title: 'Oprávnění odstraněno',
        description: 'Uživatelské oprávnění bylo úspěšně odstraněno',
        type: 'success'
      });
      loadPermissions();
    } catch (error) {
      console.error('Chyba při odstraňování oprávnění:', error);
      toaster.create({
        title: 'Chyba při odstraňování oprávnění',
        description: 'Nepodařilo se odstranit oprávnění',
        type: 'error'
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
        <VStack gap={4}>
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
        <Box
          p={4}
          bg={{ base: "red.50", _dark: "red.900" }}
          borderRadius="md"
          borderWidth="1px"
          borderColor={{ base: "red.200", _dark: "red.700" }}
          mb={4}
        >
          <VStack align="start" gap={2}>
            <Text fontWeight="bold" color={{ base: "red.800", _dark: "red.200" }}>
              Chyba při načítání
            </Text>
            <Text fontSize="sm" color={{ base: "red.700", _dark: "red.300" }}>
              {error}
            </Text>
          </VStack>
        </Box>
        <Button onClick={() => navigate('/networks')}>
          Zpět na přehled sítí
        </Button>
      </Box>
    );
  }

  return (
    <Box
      minH="100vh"
      bg={{ base: "gray.50", _dark: "gray.900" }}
      w="100%"
      maxW="100vw"
      overflow="hidden"
    >
      <Box
        maxW={{ base: "100%", lg: "1400px" }}
        mx="auto"
        w="100%"
      >
        <VStack gap={8} align="stretch" w="100%" px={{ base: 0, md: 0 }}>
          {/* Header */}
          <Box bg={{ base: "white", _dark: "gray.800" }} p={{ base: 4, md: 6 }} borderRadius="lg" shadow="sm" w="100%" overflow="hidden">
            <VStack gap={4} align="stretch" w="100%">
              <VStack
                gap={3}
                align="stretch"
                w="100%"
                display={{ base: "flex", md: "none" }}
              >
                <Button
                  onClick={handleCancel}
                  size="md"
                  variant="outline"
                  w="100%"
                >
                  Zpět na přehled sítí
                </Button>
                {isEditMode && (
                  <Button
                    onClick={onDeleteNetworkModalOpen}
                    size="md"
                    colorPalette="red"
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
                  color={{ base: "gray.600", _dark: "gray.400" }}
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
                <VStack align="start" gap={2}>
                  <Heading size="xl" wordBreak="break-word">
                    {isEditMode ? 'Upravit síť' : 'Vytvořit novou síť'}
                  </Heading>
                  <Text
                    color={{ base: "gray.600", _dark: "gray.400" }}
                    fontSize="lg"
                    wordBreak="break-word"
                  >
                    {isEditMode
                      ? 'Upravte nastavení a konfiguraci sociální sítě'
                      : 'Vytvořte novou sociální síť pro správu příspěvků'
                    }
                  </Text>
                </VStack>

                <HStack gap={3} flexWrap="wrap">
                  <Button
                    onClick={handleCancel}
                    size="lg"
                    variant="outline"
                  >
                    Zpět na přehled sítí
                  </Button>
                  {isEditMode && (
                    <IconButton
                      onClick={onDeleteNetworkModalOpen}
                      aria-label="Odstranit síť"
                      size="lg"
                      colorPalette="red"
                      variant="outline"
                    >
                      <Icon as={MdDelete} />
                    </IconButton>
                  )}
                </HStack>
              </HStack>
            </VStack>
          </Box>

          {/* Main Content */}
          <Box
            bg={{ base: "white", _dark: "gray.800" }}
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            shadow="sm"
            p={{ base: 4, md: 6 }}
          >
            <VStack gap={4} align="stretch">
              <Field.Root required invalid={!!errors.networkName}>
                <Field.Label>Název sítě</Field.Label>
                <Input
                  {...register('networkName', {
                    required: 'Zadejte prosím název sítě',
                    minLength: {
                      value: 3,
                      message: 'Název sítě musí mít alespoň 3 znaky'
                    }
                  })}
                  placeholder="Např. Oficiální Facebook stránka"
                />
                <Field.ErrorText>
                  {errors.networkName?.message}
                </Field.ErrorText>
              </Field.Root>

              <Field.Root>
                <Field.Label>Popis (poznámka)</Field.Label>
                <Textarea
                  {...register('note')}
                  placeholder="Krátký popis nebo poznámka k síti"
                  resize="none"
                />
              </Field.Root>

                {/* Network Type Selection - only for new networks */}
                {!isEditMode && (
                  <VStack gap={4} align="stretch">
                    <Heading size="md">Vyberte typ sociální sítě</Heading>

                    <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }}>
                      Zvolte typ sociální sítě, kterou chcete spravovat
                    </Text>

                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
                      {NETWORK_TYPES.map((network) => (
                        <Box
                          key={network.type}
                          as="button"
                         
                          p={4}
                          borderWidth="2px"
                          borderRadius="lg"
                          borderColor={selectedNetworkType === network.type ? { base: "blue.500", _dark: "blue.300" } : { base: "gray.200", _dark: "gray.700" }}
                          bg={selectedNetworkType === network.type ? { base: "blue.50", _dark: "blue.900" } : 'transparent'}
                          cursor="pointer"
                          transition="all 0.2s"
                          _hover={{
                            bg: selectedNetworkType === network.type ? { base: "blue.50", _dark: "blue.900" } : { base: "gray.50", _dark: "gray.700" },
                            borderColor: selectedNetworkType === network.type ? { base: "blue.500", _dark: "blue.300" } : { base: "gray.300", _dark: "gray.600" }
                          }}
                          onClick={() => setSelectedNetworkType(network.type)}
                          textAlign="left"
                        >
                          <VStack align="start" gap={3}>
                            <HStack>
                              <Badge colorPalette={network.color} variant="solid" px={2} py={1}>
                                {network.displayName}
                              </Badge>
                              {selectedNetworkType === network.type && (
                                <Icon as={MdCheck} color={`${network.color}.500`} boxSize={4} />
                              )}
                            </HStack>
                            <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }}>
                              {network.description}
                            </Text>
                          </VStack>
                        </Box>
                      ))}
                    </SimpleGrid>

                    {!selectedNetworkType && (
                      <Box
                        p={3}
                        bg={{ base: "blue.50", _dark: "blue.900" }}
                        borderRadius="md"
                        borderWidth="1px"
                        borderColor={{ base: "blue.200", _dark: "blue.700" }}
                      >
                        <Text fontSize="sm" color={{ base: "blue.800", _dark: "blue.200" }}>
                          Vyberte typ sociální sítě pro pokračování
                        </Text>
                      </Box>
                    )}
                  </VStack>
                )}

                <HStack width="full" justify="space-between">
                  <Button
                    colorPalette="blue"
                    onClick={handleSubmit(onSubmit)}
                    loading={saving}
                    loadingText={isEditMode ? 'Ukládání...' : 'Vytváření...'}
                    size="lg"
                    width="full"
                    disabled={!isEditMode && !selectedNetworkType}
                  >
                    {isEditMode ? 'Uložit změny' : 'Vytvořit síť'}
                  </Button>
                </HStack>
              </VStack>
            </Box>

          {/* VStack gap for sections */}
          <VStack gap={4} align="stretch">
            {/* Tokens Section - pouze v edit mode */}
            {isEditMode && (
              <Box
                bg={{ base: "white", _dark: "gray.800" }}
                borderColor={{ base: "gray.200", _dark: "gray.600" }}
                borderWidth="1px"
                borderRadius="lg"
                shadow="md"
                p={{ base: 4, md: 6 }}
              >
                <VStack gap={4} align="stretch">
                  <Heading size="md">Autentizační tokeny</Heading>

                  <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }}>
                    Spravujte API tokeny pro komunikaci se sociálními sítěmi
                  </Text>

                  {/* Conditional buttons based on token state */}
                  {tokens.length === 0 ? (
                    // Show only Add button when no tokens exist
                    <Button
                      colorPalette="green"
                      size={{ base: 'sm', md: 'md' }}
                      onClick={onTokenModalOpen}
                      width={{ base: 'full', md: 'auto' }}
                    >
                      Přidat tokeny pro {getNetworkTypeInfo(networkData?.networkType!)?.displayName}
                    </Button>
                  ) : (
                    // Show only Remove button when tokens exist
                    <Button
                      colorPalette="red"
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
                      borderColor={{ base: "gray.300", _dark: "gray.600" }}
                    >
                      <VStack gap={3}>
                        <Text fontSize="md" fontWeight="medium">
                          Zatím nejsou nastaveny žádné tokeny
                        </Text>
                        <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }}>
                          Přidejte autentizační tokeny pro komunikaci s API sociálních sítí
                        </Text>
                      </VStack>
                    </Box>
                  ) : (
                    <VStack gap={3} align="stretch">
                      <Text fontSize="sm" fontWeight="medium">
                        Nakonfigurované tokeny:
                      </Text>
                      <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                        {tokens.map((token, index) => (
                          <Token
                            key={`${token.tokenName}-${index}`}
                            token={token}
                          />
                        ))}
                      </SimpleGrid>
                    </VStack>
                  )}
                </VStack>
              </Box>
            )}

            {/* User Permissions Section - pouze v edit mode */}
            {isEditMode && (
              <Box
                bg={{ base: "white", _dark: "gray.800" }}
                borderColor={{ base: "gray.200", _dark: "gray.600" }}
                borderWidth="1px"
                borderRadius="lg"
                shadow="md"
                p={{ base: 4, md: 6 }}
              >
                <VStack gap={4} align="stretch">
                  <Heading size="md">Uživatelská oprávnění</Heading>

                  <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }}>
                    Spravujte oprávnění uživatelů pro tuto sociální síť
                  </Text>

                  <Button
                    colorPalette="green"
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
                      borderColor={{ base: "gray.300", _dark: "gray.600" }}
                    >
                      <VStack gap={3}>
                        <Text fontSize="md" fontWeight="medium">
                          Zatím nejsou nastavena žádná oprávnění
                        </Text>
                        <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }}>
                          Přidejte uživatelská oprávnění pro tuto sociální síť
                        </Text>
                      </VStack>
                    </Box>
                  ) : (
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                      {permissions.map((permission, index) => (
                        <Box
                          key={`${permission.user?.username}-${index}`}
                          bg={{ base: "white", _dark: "gray.700" }}
                          borderColor={{ base: "gray.200", _dark: "gray.600" }}
                          borderWidth="1px"
                          borderRadius="md"
                          shadow="sm"
                          p={4}
                        >
                          <VStack gap={3} align="stretch">
                            <HStack justify="space-between" width="100%">
                              <VStack align="start" gap={1} flex={1}>
                                <Text fontWeight="bold" fontSize="sm" lineClamp={1}>
                                  {permission.user?.displayname || 'Neznámý uživatel'}
                                </Text>
                                <Text fontSize="xs" color={{ base: "gray.600", _dark: "gray.400" }} lineClamp={1}>
                                  @{permission.user?.username || 'unknown'}
                                </Text>
                              </VStack>
                              <HStack gap={1}>
                                <IconButton
                                  aria-label="Upravit oprávnění"
                                  size="xs"
                                  variant="ghost"
                                  onClick={() => handleEditPermission(permission)}
                                >
                                  <Icon as={MdEdit} />
                                </IconButton>
                                <IconButton
                                  aria-label="Odstranit oprávnění"
                                  size="xs"
                                  variant="ghost"
                                  colorPalette="red"
                                  onClick={() => handleRemovePermission(permission.granteeId)}
                                >
                                  <Icon as={MdClose} />
                                </IconButton>
                              </HStack>
                            </HStack>

                            <HStack>
                              <Text fontWeight="medium" fontSize="sm">Oprávnění:</Text>
                              <Badge
                                colorPalette={permission.permission === 'write' ? 'green' : 'blue'}
                                fontSize="xs"
                                px={2}
                                py={1}
                                borderRadius="md"
                              >
                                {permission.permission === 'write' ? 'Úplný přístup' : 'Pouze čtení'}
                              </Badge>
                            </HStack>
                          </VStack>
                        </Box>
                      ))}
                    </SimpleGrid>
                  )}
                </VStack>
              </Box>
            )}
          </VStack>

          {/* NetworkTokenModal - uses the new universal modal component */}
          {networkData && (
            <NetworkTokenModal
              open={isTokenModalOpen}
              onClose={onTokenModalClose}
              networkType={networkData.networkType}
              onSubmit={handleAddTokens}
              loading={saving}
            />
          )}

          {/* UserPermissionModal - uses the new user permission modal component */}
          <UserPermissionModal
            open={isUserModalOpen}
            onClose={onUserModalClose}
            onSubmit={onSubmitPermission}
            loading={saving}
            editingPermission={editingPermission}
          />

          {/* Delete All Tokens Confirmation Modal */}
          <ConfirmationModal
            open={isDeleteAllTokensModalOpen}
            onClose={onDeleteAllTokensModalClose}
            title="Odstranit všechny tokeny"
            message={`Opravdu chcete odstranit všechny tokeny (${tokens.length})? Tato akce je nevratná.`}
            confirmText="Ano, odstranit"
            onConfirm={confirmDeleteAllTokens}
            loading={saving}
            colorPalette="red"
          />

          {/* Delete Network Confirmation Modal */}
          <DeleteNetworkModal
            open={isDeleteNetworkModalOpen}
            onClose={onDeleteNetworkModalClose}
            networkName={networkData?.networkName || ''}
            onConfirm={async () => {
              if (!networkId) return;

              try {
                setSaving(true);
                await networkAPI.deleteNetwork(parseInt(networkId));

                toaster.create({
                  title: 'Síť odstraněna',
                  description: 'Sociální síť byla úspěšně odstraněna',
                  type: 'success'
                });

                navigate('/networks');
              } catch (error: any) {
                console.error('Chyba při odstraňování sítě:', error);

                // Specifická chybová zpráva pro případ, kdy jsou na síť připojené příspěvky
                const errorMessage = error.response?.status === 400 || error.response?.status === 409
                  ? 'Síť se nepovedlo odstranit, je možné, že jsou na ni připojené příspěvky.'
                  : 'Nepodařilo se odstranit sociální síť.';

                toaster.create({
                  title: 'Chyba při odstraňování',
                  description: errorMessage,
                  type: 'error'
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

