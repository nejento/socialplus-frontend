import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  VStack,
  Alert,
  AlertIcon,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  FormErrorMessage,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
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
  isOpen: boolean;
  onClose: () => void;
  networkType: NetworkType;
  onSubmit: (data: TokenFormData) => Promise<void>;
  isLoading?: boolean;
}

const NetworkTokenModal: React.FC<NetworkTokenModalProps> = ({
  isOpen,
  onClose,
  networkType,
  onSubmit,
  isLoading = false,
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
          <VStack spacing={4} align="stretch">
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <VStack align="start" spacing={2} flex={1}>
                <Text fontSize="sm" fontWeight="medium">
                  Facebook Token Configuration
                </Text>
                <Text fontSize="sm">
                  Pro správné fungování potřebujeme přístup k Facebook Graph API.
                  <Button
                    variant="link"
                    size="sm"
                    color="blue.500"
                    onClick={() => window.open(getHelpUrl(), '_blank')}
                  >
                    Přečtěte si návod
                  </Button> jak získat potřebné údaje.
                </Text>
              </VStack>
            </Alert>

            <FormControl isRequired>
              <FormLabel>App ID</FormLabel>
              <Input
                {...register('appId', {
                  required: 'Zadejte prosím App ID',
                })}
                placeholder="Např. 1234567890123456"
                isInvalid={!!errors.appId}
              />
              <FormErrorMessage>
                {errors.appId?.message as string}
              </FormErrorMessage>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>App Secret</FormLabel>
              <InputGroup>
                <Input
                  {...register('appSecret', {
                    required: 'Zadejte prosím App Secret',
                  })}
                  placeholder="Např. abc123def456..."
                  type={showToken ? 'text' : 'password'}
                  isInvalid={!!errors.appSecret}
                />
                <InputRightElement>
                  <IconButton
                    aria-label={showToken ? "Skrýt token" : "Zobrazit token"}
                    icon={showToken ? <ViewOffIcon /> : <ViewIcon />}
                    size="sm"
                    variant="link"
                    onClick={() => setShowToken(!showToken)}
                  />
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage>
                {errors.appSecret?.message as string}
              </FormErrorMessage>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Page ID</FormLabel>
              <Input
                {...register('pageId', {
                  required: 'Zadejte prosím Page ID',
                })}
                placeholder="Např. 1234567890123456"
                isInvalid={!!errors.pageId}
              />
              <FormErrorMessage>
                {errors.pageId?.message as string}
              </FormErrorMessage>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Short-lived User Access Token</FormLabel>
              <InputGroup>
                <Input
                  {...register('shortLivedUserAccessToken', {
                    required: 'Zadejte prosím short-lived token',
                  })}
                  placeholder="Např. EAAG..."
                  type={showToken ? 'text' : 'password'}
                  isInvalid={!!errors.shortLivedUserAccessToken}
                />
                <InputRightElement>
                  <IconButton
                    aria-label={showToken ? "Skrýt token" : "Zobrazit token"}
                    icon={showToken ? <ViewOffIcon /> : <ViewIcon />}
                    size="sm"
                    variant="link"
                    onClick={() => setShowToken(!showToken)}
                  />
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage>
                {errors.shortLivedUserAccessToken?.message as string}
              </FormErrorMessage>
            </FormControl>
          </VStack>
        );

      case 'twitter':
        return (
          <VStack spacing={4} align="stretch">
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <VStack align="start" spacing={2} flex={1}>
                <Text fontSize="sm" fontWeight="medium">
                  Twitter API Configuration
                </Text>
                <Text fontSize="sm">
                  Pro připojení k Twitter API potřebujeme přístupové údaje z Twitter Developer portálu.
                  <Button
                    variant="link"
                    size="sm"
                    color="blue.500"
                    onClick={() => window.open(getHelpUrl(), '_blank')}
                  >
                    Přečtěte si návod
                  </Button> jak je získat.
                </Text>
              </VStack>
            </Alert>

            <FormControl isRequired>
              <FormLabel>Consumer Key (API Key)</FormLabel>
              <Input
                {...register('apiKey', {
                  required: 'Zadejte prosím Consumer Key',
                })}
                placeholder="Např. abc123..."
                isInvalid={!!errors.apiKey}
              />
              <FormErrorMessage>
                {errors.apiKey?.message as string}
              </FormErrorMessage>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Consumer Secret (API Secret)</FormLabel>
              <InputGroup>
                <Input
                  {...register('apiSecret', {
                    required: 'Zadejte prosím Consumer Secret',
                  })}
                  placeholder="Např. def456..."
                  type={showToken ? 'text' : 'password'}
                  isInvalid={!!errors.apiSecret}
                />
                <InputRightElement>
                  <IconButton
                    aria-label={showToken ? "Skrýt token" : "Zobrazit token"}
                    icon={showToken ? <ViewOffIcon /> : <ViewIcon />}
                    size="sm"
                    variant="link"
                    onClick={() => setShowToken(!showToken)}
                  />
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage>
                {errors.apiSecret?.message as string}
              </FormErrorMessage>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Access Token</FormLabel>
              <InputGroup>
                <Input
                  {...register('accessToken', {
                    required: 'Zadejte prosím Access Token',
                  })}
                  placeholder="Např. 123456789-abc..."
                  type={showToken ? 'text' : 'password'}
                  isInvalid={!!errors.accessToken}
                />
                <InputRightElement>
                  <IconButton
                    aria-label={showToken ? "Skrýt token" : "Zobrazit token"}
                    icon={showToken ? <ViewOffIcon /> : <ViewIcon />}
                    size="sm"
                    variant="link"
                    onClick={() => setShowToken(!showToken)}
                  />
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage>
                {errors.accessToken?.message as string}
              </FormErrorMessage>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Access Token Secret</FormLabel>
              <InputGroup>
                <Input
                  {...register('accessTokenSecret', {
                    required: 'Zadejte prosím Access Token Secret',
                  })}
                  placeholder="Např. xyz789..."
                  type={showToken ? 'text' : 'password'}
                  isInvalid={!!errors.accessTokenSecret}
                />
                <InputRightElement>
                  <IconButton
                    aria-label={showToken ? "Skrýt token" : "Zobrazit token"}
                    icon={showToken ? <ViewOffIcon /> : <ViewIcon />}
                    size="sm"
                    variant="link"
                    onClick={() => setShowToken(!showToken)}
                  />
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage>
                {errors.accessTokenSecret?.message as string}
              </FormErrorMessage>
            </FormControl>
          </VStack>
        );

      case 'threads':
        return (
          <VStack spacing={4} align="stretch">
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <VStack align="start" spacing={2} flex={1}>
                <Text fontSize="sm" fontWeight="medium">
                  Threads API Configuration
                </Text>
                <Text fontSize="sm">
                  Pro přístup k Meta Threads API potřebujeme přístupové údaje z Meta for Developers.
                  <Button
                    variant="link"
                    size="sm"
                    color="blue.500"
                    onClick={() => window.open(getHelpUrl(), '_blank')}
                  >
                    Přečtěte si návod
                  </Button> jak je získat.
                </Text>
              </VStack>
            </Alert>

            <FormControl isRequired>
              <FormLabel>Threads User ID</FormLabel>
              <Input
                {...register('threadsUserId', {
                  required: 'Zadejte prosím Threads User ID',
                })}
                placeholder="Např. 17841470000000000"
                isInvalid={!!errors.threadsUserId}
              />
              <FormErrorMessage>
                {errors.threadsUserId?.message as string}
              </FormErrorMessage>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>App Secret</FormLabel>
              <InputGroup>
                <Input
                  {...register('threadsAppSecret', {
                    required: 'Zadejte prosím App Secret',
                  })}
                  placeholder="Např. abc123def456..."
                  type={showToken ? 'text' : 'password'}
                  isInvalid={!!errors.threadsAppSecret}
                />
                <InputRightElement>
                  <IconButton
                    aria-label={showToken ? "Skrýt token" : "Zobrazit token"}
                    icon={showToken ? <ViewOffIcon /> : <ViewIcon />}
                    size="sm"
                    variant="link"
                    onClick={() => setShowToken(!showToken)}
                  />
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage>
                {errors.threadsAppSecret?.message as string}
              </FormErrorMessage>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Long-lived Access Token</FormLabel>
              <InputGroup>
                <Input
                  {...register('longLivedAccessToken', {
                    required: 'Zadejte prosím Long-lived Access Token',
                  })}
                  placeholder="Např. TH-..."
                  type={showToken ? 'text' : 'password'}
                  isInvalid={!!errors.longLivedAccessToken}
                />
                <InputRightElement>
                  <IconButton
                    aria-label={showToken ? "Skrýt token" : "Zobrazit token"}
                    icon={showToken ? <ViewOffIcon /> : <ViewIcon />}
                    size="sm"
                    variant="link"
                    onClick={() => setShowToken(!showToken)}
                  />
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage>
                {errors.longLivedAccessToken?.message as string}
              </FormErrorMessage>
            </FormControl>
          </VStack>
        );

      case 'mastodon':
        return (
          <VStack spacing={4} align="stretch">
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <VStack align="start" spacing={2} flex={1}>
                <Text fontSize="sm" fontWeight="medium">
                  Mastodon API Configuration
                </Text>
                <Text fontSize="sm">
                  Pro připojení k Mastodon instanci potřebujeme URL instance a access token.
                  <Button
                    variant="link"
                    size="sm"
                    color="blue.500"
                    onClick={() => window.open(getHelpUrl(), '_blank')}
                  >
                    Přečtěte si návod
                  </Button> jak je získat.
                </Text>
              </VStack>
            </Alert>

            <FormControl isRequired>
              <FormLabel>Instance URL</FormLabel>
              <Input
                {...register('instanceUrl', {
                  required: 'Zadejte prosím URL instance',
                  pattern: {
                    value: /^https?:\/\/.+/,
                    message: 'URL musí začínat http:// nebo https://'
                  }
                })}
                placeholder="Např. https://mastodon.social"
                isInvalid={!!errors.instanceUrl}
              />
              <FormErrorMessage>
                {errors.instanceUrl?.message as string}
              </FormErrorMessage>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Access Token</FormLabel>
              <InputGroup>
                <Input
                  {...register('accessToken', {
                    required: 'Zadejte prosím Access Token',
                  })}
                  placeholder="Např. abc123def456..."
                  type={showToken ? 'text' : 'password'}
                  isInvalid={!!errors.accessToken}
                />
                <InputRightElement>
                  <IconButton
                    aria-label={showToken ? "Skrýt token" : "Zobrazit token"}
                    icon={showToken ? <ViewOffIcon /> : <ViewIcon />}
                    size="sm"
                    variant="link"
                    onClick={() => setShowToken(!showToken)}
                  />
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage>
                {errors.accessToken?.message as string}
              </FormErrorMessage>
            </FormControl>
          </VStack>
        );

      case 'bluesky':
        return (
          <VStack spacing={4} align="stretch">
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <VStack align="start" spacing={2} flex={1}>
                <Text fontSize="sm" fontWeight="medium">
                  Bluesky API Configuration
                </Text>
                <Text fontSize="sm">
                  Pro přístup k Bluesky použijte své běžné přihlašovací údaje.
                  <Button
                    variant="link"
                    size="sm"
                    color="blue.500"
                    onClick={() => window.open(getHelpUrl(), '_blank')}
                  >
                    Přečtěte si návod
                  </Button> pro více informací.
                </Text>
              </VStack>
            </Alert>

            <FormControl isRequired>
              <FormLabel>Bluesky Handle</FormLabel>
              <Input
                {...register('handle', {
                  required: 'Zadejte prosím Bluesky handle',
                })}
                placeholder="Např. username.bsky.social"
                isInvalid={!!errors.handle}
              />
              <FormErrorMessage>
                {errors.handle?.message as string}
              </FormErrorMessage>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Heslo</FormLabel>
              <InputGroup>
                <Input
                  {...register('password', {
                    required: 'Zadejte prosím heslo',
                  })}
                  placeholder="Vaše Bluesky heslo"
                  type={showToken ? 'text' : 'password'}
                  isInvalid={!!errors.password}
                />
                <InputRightElement>
                  <IconButton
                    aria-label={showToken ? "Skrýt heslo" : "Zobrazit heslo"}
                    icon={showToken ? <ViewOffIcon /> : <ViewIcon />}
                    size="sm"
                    variant="link"
                    onClick={() => setShowToken(!showToken)}
                  />
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage>
                {errors.password?.message as string}
              </FormErrorMessage>
            </FormControl>
          </VStack>
        );

      default:
        return (
          <Alert status="warning" borderRadius="md">
            <AlertIcon />
            <Text fontSize="sm">
              Neznámý typ sociální sítě: {networkType}
            </Text>
          </Alert>
        );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{getModalTitle()}</ModalHeader>
        <ModalCloseButton />

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <ModalBody>
            {renderForm()}
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleClose}>
              Zrušit
            </Button>
            <Button
              colorScheme="blue"
              type="submit"
              isLoading={isLoading}
              loadingText="Přidávám..."
            >
              Přidat tokeny
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default NetworkTokenModal;
