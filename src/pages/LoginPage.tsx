import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Container,
  Heading,
  useToast,
  useColorModeValue,
  Text,
  Link,
  FormErrorMessage,
  Image,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router';

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
  const toast = useToast();
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const logoSrc = useColorModeValue('/LogoLight.svg', '/LogoDark.svg');

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
      toast({
        title: 'Chyba přihlášení',
        description: 'Neplatné přihlašovací údaje',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const onRegisterSubmit = async (data: RegisterForm) => {
    if (data.password !== data.confirmPassword) {
      toast({
        title: 'Chyba registrace',
        description: 'Hesla se neshodují',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await registerUser(data.username, data.displayname, data.password);
      // Po úspěšné registraci přesměrujeme na /login
      navigate('/login');
      toast({
        title: 'Registrace úspěšná',
        description: 'Váš účet byl vytvořen. Nyní se prosím přihlaste.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Chyba registrace',
        description: error?.response?.data?.message || 'Registrace se nezdařila',
        status: 'error',
        duration: 3000,
        isClosable: true,
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
            bg={bgColor}
            boxShadow={{ base: 'none', sm: 'md' }}
            borderRadius={{ base: 'xl', sm: 'xl' }}
            borderWidth="1px"
            borderColor={borderColor}
          >
            <VStack spacing={{ base: '4', md: '6' }}>
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
                  <VStack spacing={{ base: '4', md: '5' }}>
                    <FormControl isRequired>
                      <FormLabel fontSize={{ base: 'sm', md: 'md' }}>Username</FormLabel>
                      <Input
                        {...loginForm.register('username')}
                        size={{ base: 'sm', md: 'md' }}
                      />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel fontSize={{ base: 'sm', md: 'md' }}>Heslo</FormLabel>
                      <Input
                        type="password"
                        {...loginForm.register('password')}
                        size={{ base: 'sm', md: 'md' }}
                      />
                    </FormControl>
                    <Button
                      type="submit"
                      colorScheme="blue"
                      width="full"
                      isLoading={loginForm.formState.isSubmitting}
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
                  <VStack spacing={{ base: '4', md: '5' }}>
                    <FormControl
                      isRequired
                      isInvalid={!!registerForm.formState.errors.username}
                    >
                      <FormLabel fontSize={{ base: 'sm', md: 'md' }}>Username</FormLabel>
                      <Input
                        {...registerForm.register('username', {
                          validate: validateUsername
                        })}
                        size={{ base: 'sm', md: 'md' }}
                        placeholder="pouze písmena, číslice a _"
                      />
                      <FormErrorMessage>
                        {registerForm.formState.errors.username?.message}
                      </FormErrorMessage>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel fontSize={{ base: 'sm', md: 'md' }}>Zobrazované jméno</FormLabel>
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
                      <FormErrorMessage>
                        {registerForm.formState.errors.displayname?.message}
                      </FormErrorMessage>
                    </FormControl>

                    <FormControl
                      isRequired
                      isInvalid={!!registerForm.formState.errors.password}
                    >
                      <FormLabel fontSize={{ base: 'sm', md: 'md' }}>Heslo</FormLabel>
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
                      <FormErrorMessage>
                        {registerForm.formState.errors.password?.message}
                      </FormErrorMessage>
                    </FormControl>

                    <FormControl
                      isRequired
                      isInvalid={!!registerForm.formState.errors.confirmPassword}
                    >
                      <FormLabel fontSize={{ base: 'sm', md: 'md' }}>Potvrdit heslo</FormLabel>
                      <Input
                        type="password"
                        {...registerForm.register('confirmPassword', {
                          required: 'Potvrzení hesla je povinné'
                        })}
                        size={{ base: 'sm', md: 'md' }}
                      />
                      <FormErrorMessage>
                        {registerForm.formState.errors.confirmPassword?.message}
                      </FormErrorMessage>
                    </FormControl>

                    <Button
                      type="submit"
                      colorScheme="green"
                      width="full"
                      isLoading={registerForm.formState.isSubmitting}
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
