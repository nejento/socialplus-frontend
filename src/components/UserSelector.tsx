import React, { useState, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  IconButton,
  InputGroup,
  InputRightElement,
  Spinner,
  useColorModeValue,
  Card,
  CardBody,
  SimpleGrid,
  Badge,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, CheckIcon, CloseIcon } from '@chakra-ui/icons';
import { useForm } from 'react-hook-form';
import { userAPI } from '../services/api';
import { PostEditor } from '@/types';

interface UserSelectorProps {
  currentEditors: PostEditor[];
  onAddEditor: (userId: number, username: string) => void;
  onRemoveEditor: (userId: number) => void;
  isOwner: boolean;
  disabled: boolean;
}

interface AddEditorForm {
  username: string;
}

interface UsernameValidation {
  isValidating: boolean;
  isValid: boolean | null;
  validatedUsername: string;
  validatedUserId: number | null;
}

const UserSelector: React.FC<UserSelectorProps> = ({
  currentEditors,
  onAddEditor,
  onRemoveEditor,
  isOwner,
  disabled
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [usernameValidation, setUsernameValidation] = useState<UsernameValidation>({
    isValidating: false,
    isValid: null,
    validatedUsername: '',
    validatedUserId: null
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<AddEditorForm>({
    defaultValues: {
      username: ''
    }
  });

  // Funkce pro validaci uživatelského jména s debounce
  const validateUsername = useCallback(async (username: string) => {
    if (!username || username.length < 2) {
      setUsernameValidation({
        isValidating: false,
        isValid: null,
        validatedUsername: '',
        validatedUserId: null
      });
      return;
    }

    try {
      setUsernameValidation(prev => ({
        ...prev,
        isValidating: true,
        isValid: null
      }));

      const response = await userAPI.getUserByUsername(username);
      const userData = response.data;

      // Zkontrolujeme, zda uživatel už není editorem
      const isAlreadyEditor = currentEditors.some(editor => editor.userId === userData.id);

      setUsernameValidation({
        isValidating: false,
        isValid: !isAlreadyEditor,
        validatedUsername: username,
        validatedUserId: userData.id
      });
    } catch (error: any) {
      setUsernameValidation({
        isValidating: false,
        isValid: false,
        validatedUsername: username,
        validatedUserId: null
      });
    }
  }, [currentEditors]);

  const onSubmit = async (data: AddEditorForm) => {
    if (usernameValidation.isValid && usernameValidation.validatedUserId) {
      await onAddEditor(usernameValidation.validatedUserId, data.username);
      handleCloseModal();
    }
  };

  const handleCloseModal = () => {
    reset();
    setUsernameValidation({
      isValidating: false,
      isValid: null,
      validatedUsername: '',
      validatedUserId: null
    });
    onClose();
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Debounce validace - spustí se po 500ms po posledním zadání
    clearTimeout((window as any).userValidationTimeout);
    (window as any).userValidationTimeout = setTimeout(() => {
      validateUsername(value);
    }, 500);
  };

  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');

  const getValidationMessage = () => {
    if (usernameValidation.isValid === false && usernameValidation.validatedUsername) {
      // Zkontrolujeme, zda uživatel už není editorem
      const isAlreadyEditor = currentEditors.some(
        editor => editor.username.toLowerCase() === usernameValidation.validatedUsername.toLowerCase()
      );

      if (isAlreadyEditor) {
        return 'Tento uživatel už je editorem';
      }
      return 'Uživatel s tímto jménem neexistuje';
    }

    if (usernameValidation.isValid === true && usernameValidation.validatedUsername) {
      return 'Uživatel nalezen ✓';
    }

    return null;
  };

  const validationMessage = getValidationMessage();

  return (
    <Box>
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between">
          <FormLabel fontSize={{ base: 'md', md: 'lg' }} color={textColor} mb={0}>
            Editoři příspěvku
          </FormLabel>
          {isOwner && (
            <Button
              leftIcon={<AddIcon />}
              size={{ base: 'sm', md: 'md' }}
              onClick={onOpen}
              isDisabled={disabled}
            >
              Přidat editora
            </Button>
          )}
        </HStack>

        {currentEditors.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 3, md: 4 }}>
            {currentEditors.map((editor) => (
              <Card
                key={editor.userId}
                bg={cardBg}
                borderColor={borderColor}
                borderWidth="1px"
                size="sm"
              >
                <CardBody>
                  <HStack justify="space-between">
                    <VStack align="start" spacing={1} flex={1}>
                      <Text fontSize="sm" fontWeight="medium" color={textColor}>
                        {editor.username}
                      </Text>
                      <Badge colorScheme="blue" size="sm">
                        Editor
                      </Badge>
                    </VStack>
                    {isOwner && (
                      <IconButton
                        aria-label="Odebrat editora"
                        icon={<DeleteIcon />}
                        size="xs"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => onRemoveEditor(editor.userId)}
                        isDisabled={disabled}
                      />
                    )}
                  </HStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        ) : (
          <Text color={useColorModeValue('gray.600', 'gray.400')} fontSize="sm">
            Žádní editoři nebyli přidáni
          </Text>
        )}
      </VStack>

      {/* Modal pro přidání editora */}
      <Modal isOpen={isOpen} onClose={handleCloseModal}>
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalHeader>Přidat editora</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired isInvalid={!!errors.username}>
                  <FormLabel>Uživatelské jméno</FormLabel>
                  <InputGroup>
                    <Input
                      {...register('username', {
                        required: 'Uživatelské jméno je povinné',
                        minLength: {
                          value: 2,
                          message: 'Uživatelské jméno musí mít alespoň 2 znaky'
                        },
                        maxLength: {
                          value: 100,
                          message: 'Uživatelské jméno může mít maximálně 100 znaků'
                        },
                        onChange: handleUsernameChange
                      })}
                      placeholder="Například: jan.kovac"
                    />
                    <InputRightElement>
                      {usernameValidation.isValidating ? (
                        <Spinner size="sm" />
                      ) : usernameValidation.isValid === true ? (
                        <CheckIcon color="green.500" />
                      ) : usernameValidation.isValid === false ? (
                        <CloseIcon color="red.500" />
                      ) : null}
                    </InputRightElement>
                  </InputGroup>
                  {errors.username && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      {errors.username.message}
                    </Text>
                  )}
                  {validationMessage && (
                    <Text
                      color={usernameValidation.isValid ? "green.500" : "red.500"}
                      fontSize="sm"
                      mt={1}
                    >
                      {validationMessage}
                    </Text>
                  )}
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={handleCloseModal}>
                Zrušit
              </Button>
              <Button
                type="submit"
                colorScheme="blue"
                isDisabled={!usernameValidation.isValid || disabled}
                isLoading={disabled}
              >
                Přidat
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default UserSelector;
