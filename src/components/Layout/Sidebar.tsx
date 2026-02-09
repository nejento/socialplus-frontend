import React from 'react';
import {
  Box,
  VStack,
  Link,
  Text,
  useColorModeValue,
  Button,
  Divider,
  HStack,
  Image,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton
} from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { logout, user } = useAuth();
  const location = useLocation();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const activeBg = useColorModeValue('blue.50', 'blue.900');
  const activeColor = useColorModeValue('blue.600', 'blue.200');
  const logoSrc = useColorModeValue('/LogoLight.svg', '/LogoDark.svg');

  const navItems = [
    { path: '/', label: 'Domů', icon: '🏠' },
    { path: '/posts', label: 'Příspěvky', icon: '📝' },
    { path: '/calendar', label: 'Kalendář', icon: '📅' },
    { path: '/networks', label: 'Sociální sítě', icon: '🌐' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Chyba při odhlašování:', error);
    }
  };

  const handleNavClick = () => {
    if (onClose) {
      onClose();
    }
  };

  const sidebarContent = (
    <VStack spacing={6} align="stretch" h="full">
      {/* Logo */}
      <Box>
        <Image
          src={logoSrc}
          alt="SocialPlus"
          width="100%"
          height="auto"
          maxHeight="60px"
          objectFit="contain"
        />
      </Box>

      <Divider />

      {/* Navigace */}
      <VStack spacing={2} align="stretch" flex={1}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              as={RouterLink}
              to={item.path}
              textDecoration="none"
              _hover={{ textDecoration: 'none' }}
              onClick={handleNavClick}
            >
              <HStack
                p={3}
                borderRadius="md"
                bg={isActive ? activeBg : 'transparent'}
                color={isActive ? activeColor : 'inherit'}
                _hover={{
                  bg: isActive ? activeBg : useColorModeValue('gray.100', 'gray.700')
                }}
                transition="all 0.2s"
              >
                <Text fontSize="lg">{item.icon}</Text>
                <Text fontWeight={isActive ? 'semibold' : 'normal'}>
                  {item.label}
                </Text>
              </HStack>
            </Link>
          );
        })}
      </VStack>

      {/* User info */}
      <Box
        p={3}
        borderRadius="md"
        bg={useColorModeValue('gray.50', 'gray.700')}
        borderWidth="1px"
        borderColor={borderColor}
      >
        <Text fontSize="sm" fontWeight="medium" color={activeColor}>
          {user?.displayname}
        </Text>
        <Text fontSize="xs" color="gray.500">
          Přihlášený uživatel
        </Text>
      </Box>

      {/* Odhlášení */}
      <Box>
        <Button
          variant="ghost"
          colorScheme="red"
          size="sm"
          width="full"
          onClick={handleLogout}
        >
          Odhlásit se
        </Button>
      </Box>
    </VStack>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <Box
        position="fixed"
        left={0}
        top={0}
        h="100vh"
        w="250px"
        bg={bgColor}
        borderRight="1px"
        borderColor={borderColor}
        p={4}
        display={{ base: 'none', md: 'block' }}
      >
        {sidebarContent}
      </Box>

      {/* Mobile Drawer */}
      <Drawer
        isOpen={isOpen || false}
        placement="left"
        onClose={onClose || (() => {})}
        size="xs"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            <Image
              src={logoSrc}
              alt="SocialPlus"
              width="100%"
              height="auto"
              maxHeight="40px"
              objectFit="contain"
            />
          </DrawerHeader>
          <DrawerBody p={4}>
            <VStack spacing={4} align="stretch" h="full">
              {/* Navigace */}
              <VStack spacing={2} align="stretch" flex={1}>
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;

                  return (
                    <Link
                      key={item.path}
                      as={RouterLink}
                      to={item.path}
                      textDecoration="none"
                      _hover={{ textDecoration: 'none' }}
                      onClick={handleNavClick}
                    >
                      <HStack
                        p={3}
                        borderRadius="md"
                        bg={isActive ? activeBg : 'transparent'}
                        color={isActive ? activeColor : 'inherit'}
                        _hover={{
                          bg: isActive ? activeBg : useColorModeValue('gray.100', 'gray.700')
                        }}
                        transition="all 0.2s"
                      >
                        <Text fontSize="lg">{item.icon}</Text>
                        <Text fontWeight={isActive ? 'semibold' : 'normal'}>
                          {item.label}
                        </Text>
                      </HStack>
                    </Link>
                  );
                })}
              </VStack>

              {/* User info */}
              <Box
                p={3}
                borderRadius="md"
                bg={useColorModeValue('gray.50', 'gray.700')}
                borderWidth="1px"
                borderColor={borderColor}
              >
                <Text fontSize="sm" fontWeight="medium" color={activeColor}>
                  {user?.displayname}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  Přihlášený uživatel
                </Text>
              </Box>

              {/* Odhlášení */}
              <Box>
                <Button
                  variant="ghost"
                  colorScheme="red"
                  size="sm"
                  width="full"
                  onClick={handleLogout}
                >
                  Odhlásit se
                </Button>
              </Box>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Sidebar;
