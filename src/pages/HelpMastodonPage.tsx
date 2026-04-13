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

const HelpMastodonPage: React.FC = () => {
  return (
    <Box minH="100vh" bg={{ base: "gray.50", _dark: "gray.900" }} w="100%" maxW="100vw" overflow="hidden">
      <Box
        maxW={{ base: "100%", lg: "1400px" }}
        mx="auto"
        w="100%"
      >
        <Container maxW="4xl" py={8}>
          <Heading size="lg" color={{ base: "gray.800", _dark: "white" }} mb={8}>
            Návod: Nastavení Mastodon API
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
                ℹ️ Pro připojení Mastodon účtu potřebujete vytvořit aplikaci v nastavení vašeho Mastodon profilu a získat přístupové údaje.
              </Text>
            </Box>

            <Box bg={{ base: "white", _dark: "gray.800" }} p={6} borderRadius="lg" shadow="sm">
              <Heading size="md" mb={4} color={{ base: "gray.800", _dark: "white" }}>
                Krok 1: Přejděte do nastavení vývoje
              </Heading>
              <List.Root as="ol" gap={3}>
                <List.Item>
                  <Text>
                    Přihlaste se na vaši Mastodon instanci (např. mastodon.social, mastodon.cz, nebo jakoukoliv jinou)
                  </Text>
                </List.Item>
                <List.Item>
                  <Text>
                    V pravém horním rohu klikněte na své profilové foto a vyberte "Předvolby" nebo "Preferences"
                  </Text>
                </List.Item>
                <List.Item>
                  <Text>
                    V levém menu najděte sekci "Vývoj" nebo "Development" a klikněte na ni
                  </Text>
                </List.Item>
                <List.Item>
                  <Text>
                    Na stránce vývoje klikněte na tlačítko "Nová aplikace" pro vytvoření nové API aplikace
                  </Text>
                </List.Item>
              </List.Root>
              <Image
                src="/mastodon-development-settings.png"
                alt="Mastodon nastavení vývoje s tlačítkem Nová aplikace"
                mt={4}
                borderRadius="md"
                w="100%"
                maxW="100%"
                mx="auto"
              />
            </Box>

            <Box bg={{ base: "white", _dark: "gray.800" }} p={6} borderRadius="lg" shadow="sm">
              <Heading size="md" mb={4} color={{ base: "gray.800", _dark: "white" }}>
                Krok 2: Konfigurace nové aplikace
              </Heading>
              <List.Root as="ol" gap={3}>
                <List.Item>
                  <Text>
                    <strong>Název aplikace:</strong> Zadejte název vaší aplikace (např. "SocialPlus", "Můj Mastodon klient")
                  </Text>
                </List.Item>
                <List.Item>
                  <Text>
                    <strong>URI přesměrování:</strong> Nechte výchozí hodnotu "urn:ietf:wg:oauth:2.0:oob" - neměňte ji!
                  </Text>
                </List.Item>
                <List.Item>
                  <Text>
                    <strong>Rozsahy oprávnění:</strong> Zaškrtněte následující oprávnění:
                  </Text>
                  <List.Root as="ol" gap={2} mt={2} ml={4}>
                    <List.Item>
                      <Text><strong>read</strong> - pro čtení příspěvků a informací o účtu</Text>
                    </List.Item>
                    <List.Item>
                      <Text><strong>write</strong> - pro publikování příspěvků a interakci</Text>
                    </List.Item>
                  </List.Root>
                </List.Item>
                <List.Item>
                  <Text>
                    Klikněte na "Odeslat" nebo "Submit" pro vytvoření aplikace
                  </Text>
                </List.Item>
              </List.Root>
              <Image
                src="/mastodon-app-configuration.png"
                alt="Nastavení nové Mastodon aplikace s názvem, URI přesměrování a rozsahy oprávnění"
                mt={4}
                borderRadius="md"
                w="100%"
                maxW="100%"
                mx="auto"
              />
            </Box>

            <Box bg={{ base: "white", _dark: "gray.800" }} p={6} borderRadius="lg" shadow="sm">
              <Heading size="md" mb={4} color={{ base: "gray.800", _dark: "white" }}>
                Krok 3: Získání přístupového tokenu
              </Heading>
              <Text mb={4}>
                Po úspešném vytvoření aplikace budete přesměrováni na stránku s detaily aplikace, kde najdete:
              </Text>
              <List.Root as="ol" gap={3}>
                <List.Item>
                  <Text>
                    <strong>Váš přístupový token (Access token):</strong> Tento token budete potřebovat pro připojení k API
                  </Text>
                </List.Item>
                <List.Item>
                  <Text>
                    Zkopírujte tento token a uložte si ho - budete ho zadávat do aplikace pro připojení vašeho Mastodon účtu
                  </Text>
                </List.Item>
              </List.Root>
              <Box
                p={3}
                bg={{ base: "yellow.50", _dark: "yellow.900" }}
                borderRadius="md"
                borderWidth="1px"
                borderColor={{ base: "yellow.200", _dark: "yellow.700" }}
                mt={4}
              >
                <Text fontSize="sm" color={{ base: "yellow.800", _dark: "yellow.200" }}>
                  <strong>⚠️ Bezpečnost:</strong> Access token uchovávejte v bezpečí. Kdokoliv s tímto tokenem může přistupovat k vašemu Mastodon účtu.
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
                ✅ Access token vám umožní bezpečně připojit externí aplikace k vašemu Mastodon účtu.
              </Text>
            </Box>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
};

export default HelpMastodonPage;
