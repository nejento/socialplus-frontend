import React, { useEffect, useState } from 'react';
import {
  DialogRoot,
  DialogBackdrop,
  DialogContent,
  DialogPositioner,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
  Button,
  Field,
  VStack,
  Input,
  Box,
  Text,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  SelectContent,
  SelectItem,
  createListCollection
} from '@chakra-ui/react';
import { useForm, Controller } from 'react-hook-form';
import { userAPI } from '../services/api';

interface UserPermissionForm {
  username: string;
  permission: 'read' | 'write';
}

interface UserPermissionModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: UserPermissionForm) => Promise<void>;
  loading?: boolean;
  editingPermission?: {
    user?: {
      username: string;
    };
    permission: 'read' | 'write';
  } | null;
}

export const UserPermissionModal: React.FC<UserPermissionModalProps> = ({
  open,
  onClose,
  onSubmit,
  loading= false,
  editingPermission = null
}) => {
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
    control,
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

  const getValidationMessage = () => {
    if (usernameValidation.isValidating) {
      return 'Ověřování uživatelského jména...';
    }
    if (usernameValidation.isValid === true) {
      return 'Uživatel nalezen';
    }
    if (usernameValidation.isValid === false) {
      return 'Uživatel nenalezen';
    }
    return '';
  };

  const validationMessage = getValidationMessage();

  return (
    <DialogRoot open={open} onOpenChange={({ open }) => !open && handleClose()} size="lg">
      <DialogBackdrop />
      <DialogPositioner>
        <DialogContent>
          <DialogHeader>
            {editingPermission ? 'Upravit oprávnění' : 'Přidat uživatelské oprávnění'}
          </DialogHeader>
          <DialogCloseTrigger />

          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <DialogBody>
              <VStack gap={4} align="stretch">
                {/* Info Alert */}
                <Box
                  p={3}
                  bg={{ base: "blue.50", _dark: "blue.900" }}
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor={{ base: "blue.200", _dark: "blue.700" }}
                >
                  <Text fontSize="sm">
                    {editingPermission
                      ? 'Upravte oprávnění pro uživatele.'
                      : 'Přidejte uživatele a nastavte jeho oprávnění pro správu tohoto příspěvku.'}
                  </Text>
                </Box>

                {/* Username Field */}
                <Field.Root required invalid={!!errors.username}>
                  <Field.Label>Uživatelské jméno</Field.Label>
                  <Box position="relative">
                    <Input
                      {...register('username', {
                        required: 'Uživatelské jméno je povinné'
                      })}
                      placeholder="Např. jan.novak"
                      readOnly={!!editingPermission}
                      bg={editingPermission ? { base: "gray.100", _dark: "gray.700" } : undefined}
                      pr="12"
                    />
                    {usernameValidation.isValidating && (
                      <Box position="absolute" right={2} top="50%" transform="translateY(-50%)">
                        <Text fontSize="sm">...</Text>
                      </Box>
                    )}
                    {usernameValidation.isValid === true && (
                      <Box position="absolute" right={2} top="50%" transform="translateY(-50%)">
                        <Text color="green.500">✓</Text>
                      </Box>
                    )}
                    {usernameValidation.isValid === false && (
                      <Box position="absolute" right={2} top="50%" transform="translateY(-50%)">
                        <Text color="red.500">✗</Text>
                      </Box>
                    )}
                  </Box>
                  <Field.ErrorText>
                    {errors.username?.message as string}
                  </Field.ErrorText>
                  {validationMessage && (
                    <Text
                      fontSize="sm"
                      color={usernameValidation.isValid ? "green.500" : "red.500"}
                      mt={1}
                    >
                      {validationMessage}
                    </Text>
                  )}
                </Field.Root>

                {/* Permission Level Field */}
                <Field.Root required>
                  <Field.Label>Úroveň oprávnění</Field.Label>
                  <Controller
                    control={control}
                    name="permission"
                    render={({ field }) => (
                      <SelectRoot
                        collection={createListCollection({
                          items: [
                            { label: "Zobrazení - Může pouze zobrazit příspěvek", value: "read" },
                            { label: "Úprava - Může zobrazit a upravovat příspěvek", value: "write" }
                          ]
                        })}
                        value={field.value ? [field.value] : []}
                        onValueChange={({ value }) => field.onChange(value[0])}
                      >
                        <SelectTrigger>
                          <SelectValueText placeholder="Vyberte úroveň oprávnění" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem item={{ label: "Zobrazení - Může pouze zobrazit příspěvek", value: "read" }} key="read">
                            Zobrazení - Může pouze zobrazit příspěvek
                          </SelectItem>
                          <SelectItem item={{ label: "Úprava - Může zobrazit a upravovat příspěvek", value: "write" }} key="write">
                            Úprava - Může zobrazit a upravovat příspěvek
                          </SelectItem>
                        </SelectContent>
                      </SelectRoot>
                    )}
                  />
                  <Text fontSize="xs" color={{ base: "gray.600", _dark: "gray.400" }} mt={1}>
                    Vyberte, jaká oprávnění bude mít uživatel nad tímto příspěvkem.
                  </Text>
                </Field.Root>
              </VStack>
            </DialogBody>

            <DialogFooter gap={3}>
              <Button variant="ghost" onClick={handleClose}>
                Zrušit
              </Button>
              <Button
                type="submit"
                colorPalette="blue"
                loading={loading}
                disabled={!usernameValidation.isValid || usernameValidation.isValidating}
              >
                {editingPermission ? 'Uložit změny' : 'Přidat oprávnění'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  );
};

export default UserPermissionModal;
