import React from 'react';
import {
  Box,
  Flex,
  IconButton,
  HStack,
  useDisclosure,
  Icon
} from '@chakra-ui/react';
import { MdMenu } from 'react-icons/md';
import { useAuth } from '../../contexts/AuthContext';
import { Sidebar } from './Sidebar';
import ErrorBoundary from '../ErrorBoundary';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const { open, onOpen, onClose } = useDisclosure();

  if (loading) {
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
    <Flex minH="100vh" bg={{ base: "gray.50", _dark: "gray.900" }}>
      <ErrorBoundary>
        <Sidebar isOpen={open} onClose={onClose} />
      </ErrorBoundary>

      {/* Mobile Header */}
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        zIndex={10}
        bg={{ base: "white", _dark: "gray.800" }}
        borderBottom="1px"
        borderColor={{ base: "gray.200", _dark: "gray.600" }}
        display={{ base: 'block', md: 'none' }}
        px={4}
        py={3}
      >
        <HStack justify="space-between">
          <IconButton
            aria-label="Otevřít menu"
            variant="ghost"
            onClick={onOpen}
          >
            <Icon as={MdMenu} />
          </IconButton>
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
