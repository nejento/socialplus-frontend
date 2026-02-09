import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Image,
  OrderedList,
  ListItem,
  Alert,
  AlertIcon,
  useColorModeValue,
} from '@chakra-ui/react';

const HelpBlueskyPage: React.FC = () => {
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'gray.100');

  return (
    <Box minH="100vh" bg={bg} w="100%" maxW="100vw" overflow="hidden">
      <Box
        maxW={{ base: "100%", lg: "1400px" }}
        mx="auto"
        w="100%"
      >
        <Container maxW="4xl" py={8}>
          <Heading size="lg" color={textColor} mb={8}>
            Návod: Nastavení Bluesky API
          </Heading>

          <VStack spacing={8} align="stretch">
            <Alert status="info">
              <AlertIcon />
              <Text>
                Pro připojení Bluesky účtu potřebujete vytvořit App Password v nastavení vašeho účtu.
              </Text>
            </Alert>

            <Box bg={cardBg} p={6} borderRadius="lg" shadow="sm">
              <Heading size="md" mb={4} color={textColor}>
                Krok 1: Přejděte do nastavení
              </Heading>
              <OrderedList spacing={3}>
                <ListItem>
                  <Text>
                    Přihlaste se do své Bluesky aplikace nebo webové verze na bsky.app
                  </Text>
                </ListItem>
                <ListItem>
                  <Text>
                    Klikněte na svůj profil nebo na ikonu nastavení
                  </Text>
                </ListItem>
                <ListItem>
                  <Text>
                    V menu nastavení najděte a klikněte na položku <strong>"Privacy and Security"</strong>
                  </Text>
                </ListItem>
              </OrderedList>
              <Image
                src="/bluesky-settings-privacy.png"
                alt="Bluesky nastavení s zvýrazněnou položkou Privacy and Security"
                mt={4}
                borderRadius="md"
                w="100%"
                maxW="100%"
                mx="auto"
              />
            </Box>

            <Box bg={cardBg} p={6} borderRadius="lg" shadow="sm">
              <Heading size="md" mb={4} color={textColor}>
                Krok 2: Otevřete App Passwords
              </Heading>
              <OrderedList spacing={3}>
                <ListItem>
                  <Text>
                    V sekci "Privacy and Security" najděte položku <strong>"App passwords"</strong>
                  </Text>
                </ListItem>
                <ListItem>
                  <Text>
                    Klikněte na "App passwords" pro přístup k nastavení aplikačních hesel
                  </Text>
                </ListItem>
              </OrderedList>
              <Image
                src="/bluesky-privacy-app-passwords.png"
                alt="Nastavení Privacy and Security se zvýrazněnou položkou App passwords"
                mt={4}
                borderRadius="md"
                w="100%"
                maxW="100%"
                mx="auto"
              />
            </Box>

            <Box bg={cardBg} p={6} borderRadius="lg" shadow="sm">
              <Heading size="md" mb={4} color={textColor}>
                Krok 3: Vytvoření nového App Password
              </Heading>
              <OrderedList spacing={3}>
                <ListItem>
                  <Text>
                    Na stránce App Passwords klikněte na tlačítko <strong>"Add App Password"</strong>
                  </Text>
                </ListItem>
                <ListItem>
                  <Text>
                    Zadejte název pro vaše aplikační heslo (např. "SocialPlus", "Můj Bluesky klient")
                  </Text>
                </ListItem>
                <ListItem>
                  <Text>
                    Potvrďte vytvoření nového App Password
                  </Text>
                </ListItem>
              </OrderedList>
              <Image
                src="/bluesky-add-app-password.png"
                alt="Stránka App Passwords se zvýrazněným tlačítkem Add App Password"
                mt={4}
                borderRadius="md"
                w="100%"
                maxW="100%"
                mx="auto"
              />
            </Box>

            <Box bg={cardBg} p={6} borderRadius="lg" shadow="sm">
              <Heading size="md" mb={4} color={textColor}>
                Krok 4: Zkopírování App Password
              </Heading>
              <Text mb={4}>
                Po vytvoření se zobrazí modal s vaším novým App Password:
              </Text>
              <OrderedList spacing={3}>
                <ListItem>
                  <Text>
                    V modalu "Here is your app password!" uvidíte vygenerované heslo
                  </Text>
                </ListItem>
                <ListItem>
                  <Text>
                    <strong>Důležité:</strong> Zkopírujte si tento klíč ihned - nebude se zobrazovat znovu!
                  </Text>
                </ListItem>
                <ListItem>
                  <Text>
                    Tento App Password budete používat místo svého běžného hesla pro připojení k API
                  </Text>
                </ListItem>
              </OrderedList>
              <Image
                src="/bluesky-app-password-modal.png"
                alt="Modal s vygenerovaným App Password"
                mt={4}
                borderRadius="md"
                w="100%"
                maxW="100%"
                mx="auto"
              />
              <Alert status="warning" mt={4}>
                <AlertIcon />
                <Text>
                  <strong>Bezpečnost:</strong> App Password uchovávejte v bezpečí. Kdokoliv s tímto heslem může přistupovat k vašemu Bluesky účtu.
                </Text>
              </Alert>
            </Box>

            <Alert status="success">
              <AlertIcon />
              <Text>
                App Password vám umožní bezpečně připojit externí aplikace k vašemu Bluesky účtu bez sdílení hlavního hesla.
              </Text>
            </Alert>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
};

export default HelpBlueskyPage;
