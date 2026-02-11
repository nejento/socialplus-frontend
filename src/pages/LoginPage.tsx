import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Input,
  VStack,
  Container,
  Heading,
  Text,
  Link,
  Image,
  Field
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router';
import { toaster } from '../components/ui/toaster';
import { useColorMode } from '../components/ui/color-mode';

interface LoginForm {
  username: string;
  password: string;
}

interface RegisterForm {
  username: string;
  displayname: string;
  password: string;
  confirmPassword: string;
}

const LoginPage = () => {
  const { login, register: registerUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const { resolvedColorMode } = useColorMode();

  const logoSrc = resolvedColorMode === 'dark' ? "/LogoDark.svg" : "/LogoLight.svg";

  // Login form
  const loginForm = useForm<LoginForm>();

  // Register form
  const registerForm = useForm<RegisterForm>({
    mode: 'onChange'
  });

  const onLoginSubmit = async (data: LoginForm) => {
    try {
      await login(data.username, data.password);
      navigate('/');
    } catch (error) {
      toaster.create({
        title: 'Chyba při přihlášení',
        description: 'Neplatné přihlašovací údaje',
        type: 'error'
      });
    }
  };

  const onRegisterSubmit = async (data: RegisterForm) => {
    if (data.password !== data.confirmPassword) {
      toaster.create({
        title: 'Hesla se neshodují',
        description: 'Zadaná hesla nejsou stejná',
        type: 'error'
      });
      return;
    }

    try {
      await registerUser(data.username, data.displayname, data.password);
      navigate('/login');
      toaster.create({
        title: 'Registrace úspěšná',
        description: 'Nyní se můžete přihlásit',
        type: 'success'
      });
    } catch (error: any) {
      toaster.create({
        title: 'Chyba při registraci',
        description: error.message || 'Nepodařilo se zaregistrovat',
        type: 'error'
      });
    }
  };

  // Username validace
  const validateUsername = (value: string) => {
    if (!value) return 'Username je povinný';
    if (value.length < 3) return 'Username musí mít alespoň 3 znaky';
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      return 'Username smí obsahovat pouze písmena, číslice a podtržítko';
    }
    return true;
  };

  const toggleMode = () => {
    const newMode = !isRegisterMode;
    setIsRegisterMode(newMode);
    loginForm.reset();
    registerForm.reset();

    // Změníme URL podle režimu
    if (newMode) {
      navigate('/register', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  };

  useEffect(() => {
    // Reset form
    setIsRegisterMode(location.pathname === '/register');
  }, [location]);

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
        <Container
          maxW="lg"
          py={{ base: '8', md: '12' }}
          px={{ base: '4', sm: '8' }}
          minH="100vh"
          display="flex"
          alignItems="center"
        >
          <Box
            w="full"
            py={{ base: '6', sm: '8' }}
            px={{ base: '6', sm: '10' }}
            bg={{ base: "white", _dark: "gray.800" }}
            boxShadow={{ base: 'none', sm: 'md' }}
            borderRadius={{ base: 'xl', sm: 'xl' }}
            borderWidth="1px"
            borderColor={{ base: "gray.200", _dark: "gray.600" }}
          >
            <VStack gap={{ base: '4', md: '6' }}>
              <Box mb={2}>
                <Image
                  src={logoSrc}
                  alt="SocialPlus"
                  height={{ base: '40px', md: '50px' }}
                  width="auto"
                  objectFit="contain"
                />
              </Box>
              <Heading size={{ base: "md", md: "lg" }}>
                {isRegisterMode ? 'Vytvořit účet' : 'Vítejte zpět'}
              </Heading>

              {!isRegisterMode ? (
                // Login Form
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} style={{ width: '100%' }}>
                  <VStack gap={{ base: '4', md: '5' }}>
                    <Field.Root required>
                      <Field.Label fontSize={{ base: 'sm', md: 'md' }}>Username</Field.Label>
                      <Input
                        {...loginForm.register('username')}
                        size={{ base: 'sm', md: 'md' }}
                      />
                    </Field.Root>
                    <Field.Root required>
                      <Field.Label fontSize={{ base: 'sm', md: 'md' }}>Heslo</Field.Label>
                      <Input
                        type="password"
                        {...loginForm.register('password')}
                        size={{ base: 'sm', md: 'md' }}
                      />
                    </Field.Root>
                    <Button
                      type="submit"
                      colorPalette="blue"
                      width="full"
                      loading={loginForm.formState.isSubmitting}
                      size={{ base: 'sm', md: 'md' }}
                      fontSize={{ base: 'sm', md: 'md' }}
                    >
                      Přihlásit se
                    </Button>
                  </VStack>
                </form>
              ) : (
                // Register Form
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} style={{ width: '100%' }}>
                  <VStack gap={{ base: '4', md: '5' }}>
                    <Field.Root
                      required
                      invalid={!!registerForm.formState.errors.username}
                    >
                      <Field.Label fontSize={{ base: 'sm', md: 'md' }}>Username</Field.Label>
                      <Input
                        {...registerForm.register('username', {
                          validate: validateUsername
                        })}
                        size={{ base: 'sm', md: 'md' }}
                        placeholder="pouze písmena, číslice a _"
                      />
                      <Field.ErrorText>
                        {registerForm.formState.errors.username?.message}
                      </Field.ErrorText>
                    </Field.Root>

                    <Field.Root required invalid={!!registerForm.formState.errors.displayname}>
                      <Field.Label fontSize={{ base: 'sm', md: 'md' }}>Zobrazované jméno</Field.Label>
                      <Input
                        {...registerForm.register('displayname', {
                          required: 'Zobrazované jméno je povinné',
                          minLength: {
                            value: 2,
                            message: 'Zobrazované jméno musí mít alespoň 2 znaky'
                          }
                        })}
                        size={{ base: 'sm', md: 'md' }}
                        placeholder="Vaše celé jméno"
                      />
                      <Field.ErrorText>
                        {registerForm.formState.errors.displayname?.message}
                      </Field.ErrorText>
                    </Field.Root>

                    <Field.Root
                      required
                      invalid={!!registerForm.formState.errors.password}
                    >
                      <Field.Label fontSize={{ base: 'sm', md: 'md' }}>Heslo</Field.Label>
                      <Input
                        type="password"
                        {...registerForm.register('password', {
                          required: 'Heslo je povinné',
                          minLength: {
                            value: 6,
                            message: 'Heslo musí mít alespoň 6 znaků'
                          }
                        })}
                        size={{ base: 'sm', md: 'md' }}
                      />
                      <Field.ErrorText>
                        {registerForm.formState.errors.password?.message}
                      </Field.ErrorText>
                    </Field.Root>

                    <Field.Root
                      required
                      invalid={!!registerForm.formState.errors.confirmPassword}
                    >
                      <Field.Label fontSize={{ base: 'sm', md: 'md' }}>Potvrdit heslo</Field.Label>
                      <Input
                        type="password"
                        {...registerForm.register('confirmPassword', {
                          required: 'Potvrzení hesla je povinné'
                        })}
                        size={{ base: 'sm', md: 'md' }}
                      />
                      <Field.ErrorText>
                        {registerForm.formState.errors.confirmPassword?.message}
                      </Field.ErrorText>
                    </Field.Root>

                    <Button
                      type="submit"
                      colorPalette="green"
                      width="full"
                      loading={registerForm.formState.isSubmitting}
                      size={{ base: 'sm', md: 'md' }}
                      fontSize={{ base: 'sm', md: 'md' }}
                    >
                      Registrovat se
                    </Button>
                  </VStack>
                </form>
              )}

              <Text fontSize={{ base: 'sm', md: 'md' }} textAlign="center">
                {isRegisterMode ? (
                  <>
                    Už máte účet?{' '}
                    <Link color="blue.500" onClick={toggleMode} cursor="pointer">
                      Přihlaste se
                    </Link>
                  </>
                ) : (
                  <>
                    Nemáte účet?{' '}
                    <Link color="blue.500" onClick={toggleMode} cursor="pointer">
                      Registrujte se
                    </Link>
                  </>
                )}
              </Text>
            </VStack>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LoginPage;
