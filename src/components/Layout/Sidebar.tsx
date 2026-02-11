import React from 'react';
import {
  Box,
  VStack,
  Text,
  Button,
  Separator,
  HStack,
  Image,
  DrawerRoot,
  DrawerBackdrop,
  DrawerBody,
  DrawerHeader,
  DrawerContent,
  DrawerCloseTrigger
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
    <VStack gap={6} align="stretch" h="full">
      {/* Logo */}
      <Box>
        <picture>
          <source srcSet="/LogoDark.svg" media="(prefers-color-scheme: dark)" />
          <Image
            src="/LogoLight.svg"
            alt="SocialPlus"
            width="100%"
            height="auto"
            maxHeight="60px"
            objectFit="contain"
          />
        </picture>
      </Box>

      <Separator />

      {/* Navigace */}
      <VStack gap={2} align="stretch" flex={1}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <RouterLink
              key={item.path}
              to={item.path}
              style={{ textDecoration: 'none' }}
              onClick={handleNavClick}
            >
              <HStack
                p={3}
                borderRadius="md"
                bg={isActive ? { base: "blue.50", _dark: "blue.900" } : 'transparent'}
                color={isActive ? { base: "blue.600", _dark: "blue.200" } : 'inherit'}
                _hover={{
                  bg: isActive ? { base: "blue.50", _dark: "blue.900" } : { base: "gray.100", _dark: "gray.700" }
                }}
                transition="all 0.2s"
              >
                <Text fontSize="lg">{item.icon}</Text>
                <Text fontWeight={isActive ? 'semibold' : 'normal'}>
                  {item.label}
                </Text>
              </HStack>
            </RouterLink>
          );
        })}
      </VStack>

      {/* User info */}
      <Box
        p={3}
        borderRadius="md"
        bg={{ base: "gray.50", _dark: "gray.700" }}
        borderWidth="1px"
        borderColor={{ base: "gray.200", _dark: "gray.700" }}
      >
        <Text fontSize="sm" fontWeight="medium" color={{ base: "blue.600", _dark: "blue.200" }}>
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
          colorPalette="red"
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
        bg={{ base: "white", _dark: "gray.800" }}
        borderRight="1px"
        borderColor={{ base: "gray.200", _dark: "gray.700" }}
        p={4}
        display={{ base: 'none', md: 'block' }}
      >
        {sidebarContent}
      </Box>

      {/* Mobile Drawer */}
      <DrawerRoot
        open={isOpen || false}
        placement="start"
        onOpenChange={({ open }) => !open && onClose && onClose()}
        size="xs"
      >
        <DrawerBackdrop />
        <DrawerContent>
          <DrawerCloseTrigger />
          <DrawerHeader>
            <picture>
              <source srcSet="/LogoDark.svg" media="(prefers-color-scheme: dark)" />
              <Image
                src="/LogoLight.svg"
                alt="SocialPlus"
                width="100%"
                height="auto"
                maxHeight="40px"
                objectFit="contain"
              />
            </picture>
          </DrawerHeader>
          <DrawerBody p={4}>
            <VStack gap={4} align="stretch" h="full">
              {/* Navigace */}
              <VStack gap={2} align="stretch" flex={1}>
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;

                  return (
                    <RouterLink
                      key={item.path}
                      to={item.path}
                      style={{ textDecoration: 'none' }}
                      onClick={handleNavClick}
                    >
                      <HStack
                        p={3}
                        borderRadius="md"
                        bg={isActive ? { base: "blue.50", _dark: "blue.900" } : 'transparent'}
                        color={isActive ? { base: "blue.600", _dark: "blue.200" } : 'inherit'}
                        _hover={{
                          bg: isActive ? { base: "blue.50", _dark: "blue.900" } : { base: "gray.100", _dark: "gray.700" }
                        }}
                        transition="all 0.2s"
                      >
                        <Text fontSize="lg">{item.icon}</Text>
                        <Text fontWeight={isActive ? 'semibold' : 'normal'}>
                          {item.label}
                        </Text>
                      </HStack>
                    </RouterLink>
                  );
                })}
              </VStack>

              {/* User info */}
              <Box
                p={3}
                borderRadius="md"
                bg={{ base: "gray.50", _dark: "gray.700" }}
                borderWidth="1px"
                borderColor={{ base: "gray.200", _dark: "gray.700" }}
              >
                <Text fontSize="sm" fontWeight="medium" color={{ base: "blue.600", _dark: "blue.200" }}>
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
                  colorPalette="red"
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
      </DrawerRoot>
    </>
  );
};

