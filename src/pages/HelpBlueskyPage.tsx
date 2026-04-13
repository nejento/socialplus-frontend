import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Image,
  List
} from '@chakra-ui/react';

const HelpBlueskyPage: React.FC = () => {
  return (
    <Box minH="100vh" bg={{ base: "gray.50", _dark: "gray.900" }} w="100%" maxW="100vw" overflow="hidden">
      <Box
        maxW={{ base: "100%", lg: "1400px" }}
        mx="auto"
        w="100%"
      >
        <Container maxW="4xl" py={8}>
          <Heading size="lg" color={{ base: "gray.800", _dark: "white" }} mb={8}>
            Návod: Nastavení Bluesky API
          </Heading>

          <VStack gap={8} align="stretch">
            <Box
              p={3}
              bg={{ base: "blue.50", _dark: "blue.900" }}
              borderRadius="md"
              borderWidth="1px"
              borderColor={{ base: "blue.200", _dark: "blue.700" }}
            >
              <Text fontSize="sm" color={{ base: "blue.800", _dark: "blue.200" }}>
                ℹ️ Pro připojení Bluesky účtu potřebujete vytvořit App Password v nastavení vašeho účtu.
              </Text>
            </Box>

            <Box bg={{ base: "white", _dark: "gray.800" }} p={6} borderRadius="lg" shadow="sm">
              <Heading size="md" mb={4} color={{ base: "gray.800", _dark: "white" }}>
                Krok 1: Přejděte do nastavení
              </Heading>
              <List.Root as="ol" gap={3}>
                <List.Item>
                  <Text>
                    Přihlaste se do své Bluesky aplikace nebo webové verze na bsky.app
                  </Text>
                </List.Item>
                <List.Item>
                  <Text>
                    Klikněte na svůj profil nebo na ikonu nastavení
                  </Text>
                </List.Item>
                <List.Item>
                  <Text>
                    V menu nastavení najděte a klikněte na položku <strong>"Privacy and Security"</strong>
                  </Text>
                </List.Item>
              </List.Root>
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

            <Box bg={{ base: "white", _dark: "gray.800" }} p={6} borderRadius="lg" shadow="sm">
              <Heading size="md" mb={4} color={{ base: "gray.800", _dark: "white" }}>
                Krok 2: Otevřete App Passwords
              </Heading>
              <List.Root as="ol" gap={3}>
                <List.Item>
                  <Text>
                    V sekci "Privacy and Security" najděte položku <strong>"App passwords"</strong>
                  </Text>
                </List.Item>
                <List.Item>
                  <Text>
                    Klikněte na "App passwords" pro přístup k nastavení aplikačních hesel
                  </Text>
                </List.Item>
              </List.Root>
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

            <Box bg={{ base: "white", _dark: "gray.800" }} p={6} borderRadius="lg" shadow="sm">
              <Heading size="md" mb={4} color={{ base: "gray.800", _dark: "white" }}>
                Krok 3: Vytvoření nového App Password
              </Heading>
              <List.Root as="ol" gap={3}>
                <List.Item>
                  <Text>
                    Na stránce App Passwords klikněte na tlačítko <strong>"Add App Password"</strong>
                  </Text>
                </List.Item>
                <List.Item>
                  <Text>
                    Zadejte název pro vaše aplikační heslo (např. "SocialPlus", "Můj Bluesky klient")
                  </Text>
                </List.Item>
                <List.Item>
                  <Text>
                    Potvrďte vytvoření nového App Password
                  </Text>
                </List.Item>
              </List.Root>
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

            <Box bg={{ base: "white", _dark: "gray.800" }} p={6} borderRadius="lg" shadow="sm">
              <Heading size="md" mb={4} color={{ base: "gray.800", _dark: "white" }}>
                Krok 4: Zkopírování App Password
              </Heading>
              <Text mb={4}>
                Po vytvoření se zobrazí modal s vaším novým App Password:
              </Text>
              <List.Root as="ol" gap={3}>
                <List.Item>
                  <Text>
                    V modalu "Here is your app password!" uvidíte vygenerované heslo
                  </Text>
                </List.Item>
                <List.Item>
                  <Text>
                    <strong>Důležité:</strong> Zkopírujte si tento klíč ihned - nebude se zobrazovat znovu!
                  </Text>
                </List.Item>
                <List.Item>
                  <Text>
                    Tento App Password budete používat místo svého běžného hesla pro připojení k API
                  </Text>
                </List.Item>
              </List.Root>
              <Image
                src="/bluesky-app-password-modal.png"
                alt="Modal s vygenerovaným App Password"
                mt={4}
                borderRadius="md"
                w="100%"
                maxW="100%"
                mx="auto"
              />
              <Box
                p={3}
                bg={{ base: "yellow.50", _dark: "yellow.900" }}
                borderRadius="md"
                borderWidth="1px"
                borderColor={{ base: "yellow.200", _dark: "yellow.700" }}
                mt={4}
              >
                <Text fontSize="sm" color={{ base: "yellow.800", _dark: "yellow.200" }}>
                  <strong>⚠️ Bezpečnost:</strong> App Password uchovávejte v bezpečí. Kdokoliv s tímto heslem může přistupovat k vašemu Bluesky účtu.
                </Text>
              </Box>
            </Box>

            <Box
              p={3}
              bg={{ base: "green.50", _dark: "green.900" }}
              borderRadius="md"
              borderWidth="1px"
              borderColor={{ base: "green.200", _dark: "green.700" }}
            >
              <Text fontSize="sm" color={{ base: "green.800", _dark: "green.200" }}>
                ✅ App Password vám umožní bezpečně připojit externí aplikace k vašemu Bluesky účtu bez sdílení hlavního hesla.
              </Text>
            </Box>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
};

export default HelpBlueskyPage;
