import React, { useState } from 'react';
import {
  DialogRoot,
  DialogBackdrop,
  DialogContent,
  DialogPositioner,
  DialogHeader,
  DialogBody,
  DialogCloseTrigger,
  DialogFooter,
  VStack,
  Text,
  Button,
  Field,
  Input,
  IconButton,
  Box,
  Icon
} from '@chakra-ui/react';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { useForm } from 'react-hook-form';
import { NetworkType } from '@/types';

// Specifické formuláře tokenů pro různé sítě
interface FacebookTokenForm {
  appId: string;
  appSecret: string;
  pageId: string;
  shortLivedUserAccessToken: string;
}

interface TwitterTokenForm {
  apiKey: string;
  apiSecret: string;
  accessToken: string;
  accessTokenSecret: string;
}

interface ThreadsTokenForm {
  threadsUserId: string;
  threadsAppSecret: string;
  longLivedAccessToken: string;
}

interface MastodonTokenForm {
  instanceUrl: string;
  accessToken: string;
}

interface BlueskyTokenForm {
  handle: string;
  password: string;
}

type TokenFormData = FacebookTokenForm | TwitterTokenForm | ThreadsTokenForm | MastodonTokenForm | BlueskyTokenForm;

interface NetworkTokenModalProps {
  open: boolean;
  onClose: () => void;
  networkType: NetworkType;
  onSubmit: (data: TokenFormData) => Promise<void>;
  loading?: boolean;
}

const NetworkTokenModal: React.FC<NetworkTokenModalProps> = ({
  open,
  onClose,
  networkType,
  onSubmit,
  loading= false
}) => {
  const [showToken, setShowToken] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<any>();

  const handleClose = () => {
    reset();
    setShowToken(false);
    onClose();
  };

  const handleFormSubmit = async (data: TokenFormData) => {
    try {
      await onSubmit(data);
      handleClose();
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  const getModalTitle = () => {
    switch (networkType) {
      case 'facebook':
        return 'Přidat Facebook tokeny';
      case 'twitter':
        return 'Přidat Twitter tokeny';
      case 'threads':
        return 'Přidat Threads tokeny';
      case 'mastodon':
        return 'Přidat Mastodon tokeny';
      case 'bluesky':
        return 'Přidat Bluesky přihlášení';
      default:
        return 'Přidat tokeny';
    }
  };

  const getHelpUrl = () => {
    return `/help/${networkType}`;
  };

  const renderForm = () => {
    switch (networkType) {
      case 'facebook':
        return (
          <VStack gap={4} align="stretch">
            <Box
              p={3}
              bg={{ base: "blue.50", _dark: "blue.900" }}
              borderRadius="md"
              borderWidth="1px"
              borderColor={{ base: "blue.200", _dark: "blue.700" }}
            >
              <VStack align="start" gap={2}>
                <Text fontSize="sm" fontWeight="medium">
                  Facebook Token Configuration
                </Text>
                <Text fontSize="sm">
                  Pro správné fungování potřebujeme přístup k Facebook Graph API.
                  <Button
                    variant="plain"
                    size="sm"
                    color="blue.500"
                    onClick={() => window.open(getHelpUrl(), '_blank')}
                  >
                    Přečtěte si návod
                  </Button> jak získat potřebné údaje.
                </Text>
              </VStack>
            </Box>

            <Field.Root required>
              <Field.Label>App ID</Field.Label>
              <Input
                {...register('appId', {
                  required: 'Zadejte prosím App ID'
                })}
                placeholder="Např. 1234567890123456"
              />
              <Field.ErrorText>
                {errors.appId?.message as string}
              </Field.ErrorText>
            </Field.Root>

            <Field.Root required>
              <Field.Label>App Secret</Field.Label>
              <Box position="relative">
                <Input
                  {...register('appSecret', {
                    required: 'Zadejte prosím App Secret'
                  })}
                  placeholder="Např. abc123def456..."
                  type={showToken ? 'text' : 'password'}
                  pr="12"
                />
                <IconButton
                  aria-label={showToken ? "Skrýt token" : "Zobrazit token"}
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowToken(!showToken)}
                  position="absolute"
                  right={2}
                  top="50%"
                  transform="translateY(-50%)"
                >
                  {showToken ? <Icon as={MdVisibilityOff} /> : <Icon as={MdVisibility} />}
                </IconButton>
              </Box>
              <Field.ErrorText>
                {errors.appSecret?.message as string}
              </Field.ErrorText>
            </Field.Root>

            <Field.Root required>
              <Field.Label>Page ID</Field.Label>
              <Input
                {...register('pageId', {
                  required: 'Zadejte prosím Page ID'
                })}
                placeholder="Např. 1234567890123456"
              />
              <Field.ErrorText>
                {errors.pageId?.message as string}
              </Field.ErrorText>
            </Field.Root>

            <Field.Root required>
              <Field.Label>Short-lived User Access Token</Field.Label>
              <Box position="relative">
                <Input
                  {...register('shortLivedUserAccessToken', {
                    required: 'Zadejte prosím short-lived token'
                  })}
                  placeholder="Např. EAAG..."
                  type={showToken ? 'text' : 'password'}
                  pr="12"
                />
                <IconButton
                  aria-label={showToken ? "Skrýt token" : "Zobrazit token"}
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowToken(!showToken)}
                  position="absolute"
                  right={2}
                  top="50%"
                  transform="translateY(-50%)"
                >
                  {showToken ? <Icon as={MdVisibilityOff} /> : <Icon as={MdVisibility} />}
                </IconButton>
              </Box>
              <Field.ErrorText>
                {errors.shortLivedUserAccessToken?.message as string}
              </Field.ErrorText>
            </Field.Root>
          </VStack>
        );

      case 'twitter':
        return (
          <VStack gap={4} align="stretch">
            <Box
              p={3}
              bg={{ base: "blue.50", _dark: "blue.900" }}
              borderRadius="md"
              borderWidth="1px"
              borderColor={{ base: "blue.200", _dark: "blue.700" }}
            >
              <VStack align="start" gap={2}>
                <Text fontSize="sm" fontWeight="medium">
                  Twitter API Configuration
                </Text>
                <Text fontSize="sm">
                  Pro připojení k Twitter API potřebujeme přístupové údaje z Twitter Developer portálu.
                  <Button
                    variant="plain"
                    size="sm"
                    color="blue.500"
                    onClick={() => window.open(getHelpUrl(), '_blank')}
                  >
                    Přečtěte si návod
                  </Button> jak je získat.
                </Text>
              </VStack>
            </Box>

            <Field.Root required>
              <Field.Label>Consumer Key (API Key)</Field.Label>
              <Input
                {...register('apiKey', {
                  required: 'Zadejte prosím Consumer Key'
                })}
                placeholder="Např. abc123..."
              />
              <Field.ErrorText>
                {errors.apiKey?.message as string}
              </Field.ErrorText>
            </Field.Root>

            <Field.Root required>
              <Field.Label>Consumer Secret (API Secret)</Field.Label>
              <Box position="relative">
                <Input
                  {...register('apiSecret', {
                    required: 'Zadejte prosím Consumer Secret'
                  })}
                  placeholder="Např. def456..."
                  type={showToken ? 'text' : 'password'}
                  pr="12"
                />
                <IconButton
                  aria-label={showToken ? "Skrýt token" : "Zobrazit token"}
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowToken(!showToken)}
                  position="absolute"
                  right={2}
                  top="50%"
                  transform="translateY(-50%)"
                >
                  {showToken ? <Icon as={MdVisibilityOff} /> : <Icon as={MdVisibility} />}
                </IconButton>
              </Box>
              <Field.ErrorText>
                {errors.apiSecret?.message as string}
              </Field.ErrorText>
            </Field.Root>

            <Field.Root required>
              <Field.Label>Access Token</Field.Label>
              <Box position="relative">
                <Input
                  {...register('accessToken', {
                    required: 'Zadejte prosím Access Token'
                  })}
                  placeholder="Např. 123456789-abc..."
                  type={showToken ? 'text' : 'password'}
                  pr="12"
                />
                <IconButton
                  aria-label={showToken ? "Skrýt token" : "Zobrazit token"}
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowToken(!showToken)}
                  position="absolute"
                  right={2}
                  top="50%"
                  transform="translateY(-50%)"
                >
                  {showToken ? <Icon as={MdVisibilityOff} /> : <Icon as={MdVisibility} />}
                </IconButton>
              </Box>
              <Field.ErrorText>
                {errors.accessToken?.message as string}
              </Field.ErrorText>
            </Field.Root>

            <Field.Root required>
              <Field.Label>Access Token Secret</Field.Label>
              <Box position="relative">
                <Input
                  {...register('accessTokenSecret', {
                    required: 'Zadejte prosím Access Token Secret'
                  })}
                  placeholder="Např. xyz789..."
                  type={showToken ? 'text' : 'password'}
                  pr="12"
                />
                <IconButton
                  aria-label={showToken ? "Skrýt token" : "Zobrazit token"}
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowToken(!showToken)}
                  position="absolute"
                  right={2}
                  top="50%"
                  transform="translateY(-50%)"
                >
                  {showToken ? <Icon as={MdVisibilityOff} /> : <Icon as={MdVisibility} />}
                </IconButton>
              </Box>
              <Field.ErrorText>
                {errors.accessTokenSecret?.message as string}
              </Field.ErrorText>
            </Field.Root>
          </VStack>
        );

      case 'threads':
        return (
          <VStack gap={4} align="stretch">
            <Box
              p={3}
              bg={{ base: "blue.50", _dark: "blue.900" }}
              borderRadius="md"
              borderWidth="1px"
              borderColor={{ base: "blue.200", _dark: "blue.700" }}
            >
              <VStack align="start" gap={2}>
                <Text fontSize="sm" fontWeight="medium">
                  Threads API Configuration
                </Text>
                <Text fontSize="sm">
                  Pro přístup k Meta Threads API potřebujeme přístupové údaje z Meta for Developers.
                  <Button
                    variant="plain"
                    size="sm"
                    color="blue.500"
                    onClick={() => window.open(getHelpUrl(), '_blank')}
                  >
                    Přečtěte si návod
                  </Button> jak je získat.
                </Text>
              </VStack>
            </Box>

            <Field.Root required>
              <Field.Label>Threads User ID</Field.Label>
              <Input
                {...register('threadsUserId', {
                  required: 'Zadejte prosím Threads User ID'
                })}
                placeholder="Např. 17841470000000000"
              />
              <Field.ErrorText>
                {errors.threadsUserId?.message as string}
              </Field.ErrorText>
            </Field.Root>

            <Field.Root required>
              <Field.Label>App Secret</Field.Label>
              <Box position="relative">
                <Input
                  {...register('threadsAppSecret', {
                    required: 'Zadejte prosím App Secret'
                  })}
                  placeholder="Např. abc123def456..."
                  type={showToken ? 'text' : 'password'}
                  pr="12"
                />
                <IconButton
                  aria-label={showToken ? "Skrýt token" : "Zobrazit token"}
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowToken(!showToken)}
                  position="absolute"
                  right={2}
                  top="50%"
                  transform="translateY(-50%)"
                >
                  {showToken ? <Icon as={MdVisibilityOff} /> : <Icon as={MdVisibility} />}
                </IconButton>
              </Box>
              <Field.ErrorText>
                {errors.threadsAppSecret?.message as string}
              </Field.ErrorText>
            </Field.Root>

            <Field.Root required>
              <Field.Label>Long-lived Access Token</Field.Label>
              <Box position="relative">
                <Input
                  {...register('longLivedAccessToken', {
                    required: 'Zadejte prosím Long-lived Access Token'
                  })}
                  placeholder="Např. TH-..."
                  type={showToken ? 'text' : 'password'}
                  pr="12"
                />
                <IconButton
                  aria-label={showToken ? "Skrýt token" : "Zobrazit token"}
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowToken(!showToken)}
                  position="absolute"
                  right={2}
                  top="50%"
                  transform="translateY(-50%)"
                >
                  {showToken ? <Icon as={MdVisibilityOff} /> : <Icon as={MdVisibility} />}
                </IconButton>
              </Box>
              <Field.ErrorText>
                {errors.longLivedAccessToken?.message as string}
              </Field.ErrorText>
            </Field.Root>
          </VStack>
        );

      case 'mastodon':
        return (
          <VStack gap={4} align="stretch">
            <Box
              p={3}
              bg={{ base: "blue.50", _dark: "blue.900" }}
              borderRadius="md"
              borderWidth="1px"
              borderColor={{ base: "blue.200", _dark: "blue.700" }}
            >
              <VStack align="start" gap={2}>
                <Text fontSize="sm" fontWeight="medium">
                  Mastodon API Configuration
                </Text>
                <Text fontSize="sm">
                  Pro připojení k Mastodon instanci potřebujeme URL instance a access token.
                  <Button
                    variant="plain"
                    size="sm"
                    color="blue.500"
                    onClick={() => window.open(getHelpUrl(), '_blank')}
                  >
                    Přečtěte si návod
                  </Button> jak je získat.
                </Text>
              </VStack>
            </Box>

            <Field.Root required>
              <Field.Label>Instance URL</Field.Label>
              <Input
                {...register('instanceUrl', {
                  required: 'Zadejte prosím URL instance',
                  pattern: {
                    value: /^https?:\/\/.+/,
                    message: 'URL musí začínat http:// nebo https://'
                  }
                })}
                placeholder="Např. https://mastodon.social"
              />
              <Field.ErrorText>
                {errors.instanceUrl?.message as string}
              </Field.ErrorText>
            </Field.Root>

            <Field.Root required>
              <Field.Label>Access Token</Field.Label>
              <Box position="relative">
                <Input
                  {...register('accessToken', {
                    required: 'Zadejte prosím Access Token'
                  })}
                  placeholder="Např. abc123def456..."
                  type={showToken ? 'text' : 'password'}
                  pr="12"
                />
                <IconButton
                  aria-label={showToken ? "Skrýt token" : "Zobrazit token"}
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowToken(!showToken)}
                  position="absolute"
                  right={2}
                  top="50%"
                  transform="translateY(-50%)"
                >
                  {showToken ? <Icon as={MdVisibilityOff} /> : <Icon as={MdVisibility} />}
                </IconButton>
              </Box>
              <Field.ErrorText>
                {errors.accessToken?.message as string}
              </Field.ErrorText>
            </Field.Root>
          </VStack>
        );

      case 'bluesky':
        return (
          <VStack gap={4} align="stretch">
            <Box
              p={3}
              bg={{ base: "blue.50", _dark: "blue.900" }}
              borderRadius="md"
              borderWidth="1px"
              borderColor={{ base: "blue.200", _dark: "blue.700" }}
            >
              <VStack align="start" gap={2}>
                <Text fontSize="sm" fontWeight="medium">
                  Bluesky API Configuration
                </Text>
                <Text fontSize="sm">
                  Pro přístup k Bluesky použijte své běžné přihlašovací údaje.
                  <Button
                    variant="plain"
                    size="sm"
                    color="blue.500"
                    onClick={() => window.open(getHelpUrl(), '_blank')}
                  >
                    Přečtěte si návod
                  </Button> pro více informací.
                </Text>
              </VStack>
            </Box>

            <Field.Root required>
              <Field.Label>Bluesky Handle</Field.Label>
              <Input
                {...register('handle', {
                  required: 'Zadejte prosím Bluesky handle'
                })}
                placeholder="Např. username.bsky.social"
              />
              <Field.ErrorText>
                {errors.handle?.message as string}
              </Field.ErrorText>
            </Field.Root>

            <Field.Root required>
              <Field.Label>Heslo</Field.Label>
              <Box position="relative">
                <Input
                  {...register('password', {
                    required: 'Zadejte prosím heslo'
                  })}
                  placeholder="Vaše Bluesky heslo"
                  type={showToken ? 'text' : 'password'}
                  pr="12"
                />
                <IconButton
                  aria-label={showToken ? "Skrýt heslo" : "Zobrazit heslo"}
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowToken(!showToken)}
                  position="absolute"
                  right={2}
                  top="50%"
                  transform="translateY(-50%)"
                >
                  {showToken ? <Icon as={MdVisibilityOff} /> : <Icon as={MdVisibility} />}
                </IconButton>
              </Box>
              <Field.ErrorText>
                {errors.password?.message as string}
              </Field.ErrorText>
            </Field.Root>
          </VStack>
        );

      default:
        return (
          <Box
            p={3}
            bg={{ base: "yellow.50", _dark: "yellow.900" }}
            borderRadius="md"
            borderWidth="1px"
            borderColor={{ base: "yellow.200", _dark: "yellow.700" }}
          >
            <Text fontSize="sm">
              Neznámý typ sociální sítě: {networkType}
            </Text>
          </Box>
        );
    }
  };

  return (
    <DialogRoot open={open} onOpenChange={(e) => !e.open && onClose()} size="lg">
      <DialogBackdrop />
      <DialogPositioner>
        <DialogContent>
          <DialogHeader>{getModalTitle()}</DialogHeader>
          <DialogCloseTrigger />

          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <DialogBody>
              {renderForm()}
            </DialogBody>

            <DialogFooter gap={3}>
              <Button variant="ghost" onClick={handleClose}>
                Zrušit
              </Button>
              <Button
                colorPalette="blue"
                type="submit"
                loading={loading}
                loadingText="Přidávám..."
              >
                Přidat tokeny
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  );
};

export default NetworkTokenModal;
