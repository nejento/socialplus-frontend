import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  FormErrorMessage,
  InputGroup,
  InputRightElement,
  Spinner,
  Text,
  Alert,
  AlertIcon,
  HStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { CheckIcon, CloseIcon } from '@chakra-ui/icons';
import { useForm } from 'react-hook-form';
import { userAPI } from '../services/api';

interface UserPermissionForm {
  username: string;
  permission: 'read' | 'write';
}

interface UserPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserPermissionForm) => Promise<void>;
  isLoading?: boolean;
  editingPermission?: {
    user?: {
      username: string;
    };
    permission: 'read' | 'write';
  } | null;
}

const UserPermissionModal: React.FC<UserPermissionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  editingPermission = null,
}) => {
  // Color mode values pro správné stylování
  const inputBg = useColorModeValue('white', 'gray.700');
  const readOnlyBg = useColorModeValue('gray.50', 'gray.600');
  const textColor = useColorModeValue('gray.500', 'gray.400');

  const [usernameValidation, setUsernameValidation] = useState<{
    isValidating: boolean;
    isValid: boolean | null;
    validatedUsername: string;
  }>({
    isValidating: false,
    isValid: null,
    validatedUsername: ''
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<UserPermissionForm>({
    defaultValues: {
      username: '',
      permission: 'read'
    }
  });

  const watchedUsername = watch('username');

  useEffect(() => {
    if (editingPermission) {
      setValue('username', editingPermission.user?.username || '');
      setValue('permission', editingPermission.permission);
      setUsernameValidation({
        isValidating: false,
        isValid: true,
        validatedUsername: editingPermission.user?.username || ''
      });
    } else {
      reset();
      setUsernameValidation({
        isValidating: false,
        isValid: null,
        validatedUsername: ''
      });
    }
  }, [editingPermission, setValue, reset]);

  useEffect(() => {
    if (watchedUsername && !editingPermission) {
      const debounce = setTimeout(() => {
        validateUsername(watchedUsername);
      }, 500);

      return () => clearTimeout(debounce);
    }
  }, [watchedUsername, editingPermission]);

  const validateUsername = async (username: string) => {
    if (!username || username.length < 2) {
      setUsernameValidation({
        isValidating: false,
        isValid: null,
        validatedUsername: ''
      });
      return;
    }

    try {
      setUsernameValidation(prev => ({
        ...prev,
        isValidating: true,
        isValid: null
      }));

      await userAPI.getUserByUsername(username);

      setUsernameValidation({
        isValidating: false,
        isValid: true,
        validatedUsername: username
      });
    } catch (error: any) {
      setUsernameValidation({
        isValidating: false,
        isValid: false,
        validatedUsername: username
      });
    }
  };

  const handleClose = () => {
    reset();
    setUsernameValidation({
      isValidating: false,
      isValid: null,
      validatedUsername: ''
    });
    onClose();
  };

  const handleFormSubmit = async (data: UserPermissionForm) => {
    try {
      await onSubmit(data);
      handleClose();
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  const getUsernameValidationIcon = () => {
    if (usernameValidation.isValidating) {
      return <Spinner size="sm" />;
    }
    if (usernameValidation.isValid === true) {
      return <CheckIcon color="green.500" />;
    }
    if (usernameValidation.isValid === false) {
      return <CloseIcon color="red.500" />;
    }
    return null;
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {editingPermission ? 'Upravit oprávnění' : 'Přidat uživatele'}
        </ModalHeader>
        <ModalCloseButton />

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <VStack align="start" spacing={1} flex={1}>
                  <Text fontSize="sm" fontWeight="medium">
                    Uživatelská oprávnění
                  </Text>
                  <Text fontSize="sm">
                    Přidejte nebo upravte oprávnění pro přístup k této sociální síti.
                  </Text>
                </VStack>
              </Alert>

              <FormControl isRequired isInvalid={!!errors.username}>
                <FormLabel>Uživatelské jméno</FormLabel>
                <InputGroup>
                  <Input
                    {...register('username', {
                      required: 'Zadejte prosím uživatelské jméno',
                      minLength: {
                        value: 2,
                        message: 'Uživatelské jméno musí mít alespoň 2 znaky'
                      }
                    })}
                    placeholder="Např. jannovak"
                    isReadOnly={!!editingPermission}
                    bg={editingPermission ? readOnlyBg : inputBg}
                  />
                  <InputRightElement>
                    {getUsernameValidationIcon()}
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>
                  {errors.username?.message}
                </FormErrorMessage>
                {usernameValidation.isValid === false && usernameValidation.validatedUsername === watchedUsername && (
                  <Text fontSize="sm" color="red.500" mt={1}>
                    Uživatel s tímto jménem neexistuje
                  </Text>
                )}
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Úroveň oprávnění</FormLabel>
                <Select
                  {...register('permission', {
                    required: 'Vyberte prosím úroveň oprávnění',
                  })}
                  bg={inputBg}
                  color={useColorModeValue('black', 'white')}
                  _focus={{
                    borderColor: useColorModeValue('blue.500', 'blue.300'),
                    boxShadow: useColorModeValue('0 0 0 1px blue.500', '0 0 0 1px blue.300'),
                  }}
                >
                  <option value="read" style={{ backgroundColor: useColorModeValue('#ffffff', '#2D3748'), color: useColorModeValue('#000000', '#ffffff') }}>
                    Pouze čtení
                  </option>
                  <option value="write" style={{ backgroundColor: useColorModeValue('#ffffff', '#2D3748'), color: useColorModeValue('#000000', '#ffffff') }}>
                    Úplný přístup
                  </option>
                </Select>
                <Text fontSize="sm" color={textColor} mt={2}>
                  <strong>Pouze čtení:</strong> Může zobrazovat obsah sociální sítě<br />
                  <strong>Úplný přístup:</strong> Může upravovat a publikovat obsah
                </Text>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={handleClose} isDisabled={isLoading}>
                Zrušit
              </Button>
              <Button
                colorScheme="blue"
                type="submit"
                isLoading={isLoading}
                loadingText={editingPermission ? "Aktualizuji..." : "Přidávám..."}
                isDisabled={
                  !editingPermission &&
                  (usernameValidation.isValid !== true || usernameValidation.validatedUsername !== watchedUsername)
                }
              >
                {editingPermission ? 'Aktualizovat oprávnění' : 'Přidat uživatele'}
              </Button>
            </HStack>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default UserPermissionModal;
