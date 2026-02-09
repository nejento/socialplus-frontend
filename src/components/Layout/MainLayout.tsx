import React from 'react';
import {
  Box,
  Flex,
  useColorModeValue,
  IconButton,
  HStack,
  useDisclosure
} from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import { useAuth } from '../../contexts/AuthContext';
import { Sidebar } from './Sidebar';
import ErrorBoundary from '../ErrorBoundary';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const headerBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const { isOpen, onOpen, onClose } = useDisclosure();

  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH="100vh">
        <Box>Načítání...</Box>
      </Flex>
    );
  }

  if (!user) {
    return null; // Toto by se nemělo stát díky PrivateRoute, ale pro jistotu
  }

  return (
    <Flex minH="100vh" bg={bgColor}>
      <ErrorBoundary>
        <Sidebar isOpen={isOpen} onClose={onClose} />
      </ErrorBoundary>

      {/* Mobile Header */}
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        zIndex={10}
        bg={headerBg}
        borderBottom="1px"
        borderColor={borderColor}
        display={{ base: 'block', md: 'none' }}
        px={4}
        py={3}
      >
        <HStack justify="space-between">
          <IconButton
            aria-label="Otevřít menu"
            icon={<HamburgerIcon />}
            variant="ghost"
            onClick={onOpen}
          />
        </HStack>
      </Box>

      <Box flex="1" ml={{ base: 0, md: '250px' }}>
        <Box p={{ base: 4, md: 6 }} pt={{ base: 16, md: 6 }}>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </Box>
      </Box>
    </Flex>
  );
};
