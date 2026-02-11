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

const HelpThreadsPage: React.FC = () => {
  return (
    <Box minH="100vh" bg={{ base: "gray.50", _dark: "gray.900" }} w="100%" maxW="100vw" overflow="hidden">
      <Box
        maxW={{ base: "100%", lg: "1400px" }}
        mx="auto"
        w="100%"
      >
        <Container maxW="4xl" py={8}>
          <Heading size="lg" color={{ base: "gray.800", _dark: "white" }} mb={8}>
            Návod: Nastavení Meta Threads API
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
                ℹ️ Pro připojení Meta Threads potřebujete vytvořit Meta App a získat potřebné přístupové údaje. Proces je podobný jako u Facebooku.
              </Text>
            </Box>

            <Box bg={{ base: "white", _dark: "gray.800" }} p={6} borderRadius="lg" shadow="sm">
              <Heading size="md" mb={4} color={{ base: "gray.800", _dark: "white" }}>
                Krok 1: Vytvoření Facebook App
              </Heading>
              <List.Root as="ol" gap={3}>
                <List.Item>
                  <Text>
                    Přejděte na <strong>Meta for Developers</strong> portál (<strong>developers.facebook.com</strong>) a klikněte na tlačítko <strong>"Create App"</strong>
                  </Text>
                </List.Item>
                <List.Item>
                  <Text>
                    <strong>Tip:</strong> Pokud už máte aplikaci pro Facebook Pages, můžete jen rozšířit Use case bez potřeby vytvářet další aplikaci
                  </Text>
                </List.Item>
                <List.Item>
                  <Text>
                    Proces vytvoření aplikace je stejný jako u Facebook API
                  </Text>
                </List.Item>
              </List.Root>
              <Image
                src="/facebook-create-app.png"
                alt="Meta for Developers stránka s tlačítkem Create App"
                mt={4}
                borderRadius="md"
                w="100%"
                maxW="100%"
                mx="auto"
              />
            </Box>

            <Box bg={{ base: "white", _dark: "gray.800" }} p={6} borderRadius="lg" shadow="sm">
              <Heading size="md" mb={4} color={{ base: "gray.800", _dark: "white" }}>
                Krok 2: Výběr Threads API use case
              </Heading>
              <List.Root as="ol" gap={3}>
                <List.Item>
                  <Text>
                    Na stránce "Add use cases" vyberte možnost <strong>"Access the Threads API"</strong>
                  </Text>
                </List.Item>
                <List.Item>
                  <Text>
                    Tato možnost umožní přístup k Threads platformě pro publikování a správu obsahu
                  </Text>
                </List.Item>
              </List.Root>
              <Image
                src="/threads-use-cases.png"
                alt="Stránka s výběrem Add use cases - zvýrazněno Access the Threads API"
                mt={4}
                borderRadius="md"
                w="100%"
                maxW="100%"
                mx="auto"
              />
            </Box>

            <Box bg={{ base: "white", _dark: "gray.800" }} p={6} borderRadius="lg" shadow="sm">
              <Heading size="md" mb={4} color={{ base: "gray.800", _dark: "white" }}>
                Krok 3: Konfigurace oprávnění
              </Heading>
              <List.Root as="ol" gap={3}>
                <List.Item>
                  <Text>
                    V dashboardu aplikace přejděte na <strong>"Customize use case"</strong>
                  </Text>
                </List.Item>
                <List.Item>
                  <Text>
                    V sekci <strong>"Permissions and features"</strong> nastavte tato oprávnění:
                  </Text>
                  <List.Root as="ol" mt={2} ml={4}>
                    <List.Item>
                      <Text><strong>threads_basic</strong> - základní přístup k Threads</Text>
                    </List.Item>
                    <List.Item>
                      <Text><strong>threads_content_publish</strong> - publikování obsahu na Threads</Text>
                    </List.Item>
                  </List.Root>
                </List.Item>
              </List.Root>
              <Image
                src="/threads-permissions.png"
                alt="Customize use case s nastaveními Threads oprávnění"
                mt={4}
                borderRadius="md"
                w="100%"
                maxW="100%"
                mx="auto"
              />
            </Box>

            <Box bg={{ base: "white", _dark: "gray.800" }} p={6} borderRadius="lg" shadow="sm">
              <Heading size="md" mb={4} color={{ base: "gray.800", _dark: "white" }}>
                Krok 4: Získání App ID a App Secret
              </Heading>
              <List.Root as="ol" gap={3}>
                <List.Item>
                  <Text>
                    V "Customize use case" přejděte do sekce <strong>"Settings"</strong>
                  </Text>
                </List.Item>
                <List.Item>
                  <Text>
                    Zde najdete důležité údaje pro aplikaci:
                  </Text>
                  <List.Root as="ol" mt={2} ml={4}>
                    <List.Item>
                      <Text><strong>Threads app ID</strong> - identifikátor aplikace</Text>
                    </List.Item>
                    <List.Item>
                      <Text><strong>Threads app secret</strong> - tajný klíč aplikace</Text>
                    </List.Item>
                  </List.Root>
                </List.Item>
                <List.Item>
                  <Text>
                    Tyto údaje si poznamenejte, budete je potřebovat pro konfiguraci aplikace
                  </Text>
                </List.Item>
              </List.Root>
              <Image
                src="/threads-app-settings.png"
                alt="Settings s Threads app ID a app secret"
                mt={4}
                borderRadius="md"
                w="100%"
                maxW="100%"
                mx="auto"
              />
            </Box>

            <Box bg={{ base: "white", _dark: "gray.800" }} p={6} borderRadius="lg" shadow="sm">
              <Heading size="md" mb={4} color={{ base: "gray.800", _dark: "white" }}>
                Krok 5: Přidání Threads Tester uživatele
              </Heading>
              <List.Root as="ol" gap={3}>
                <List.Item>
                  <Text>
                    V menu aplikace přejděte na <strong>"App roles"</strong> → <strong>"Roles"</strong>
                  </Text>
                </List.Item>
                <List.Item>
                  <Text>
                    Klikněte na tlačítko <strong>"Add People"</strong>
                  </Text>
                </List.Item>
                <List.Item>
                  <Text>
                    Přidejte vaše uživatelské jméno (handle) z Threads jako testera
                  </Text>
                </List.Item>
                <List.Item>
                  <Text>
                    Tento krok je nutný pro testování aplikace s vaším Threads účtem
                  </Text>
                </List.Item>
              </List.Root>
              <Image
                src="/threads-add-tester.png"
                alt="App roles s tlačítkem Add People pro přidání Threads tester uživatele"
                mt={4}
                borderRadius="md"
                w="100%"
                maxW="100%"
                mx="auto"
              />
            </Box>

            <Box bg={{ base: "white", _dark: "gray.800" }} p={6} borderRadius="lg" shadow="sm">
              <Heading size="md" mb={4} color={{ base: "gray.800", _dark: "white" }}>
                Krok 6: Schválení v Threads aplikaci
              </Heading>
              <List.Root as="ol" gap={3}>
                <List.Item>
                  <Text>
                    Otevřete Threads aplikaci a přejděte do <strong>"Účet"</strong> → <strong>"Oprávnění webu"</strong>
                  </Text>
                </List.Item>
                <List.Item>
                  <Text>
                    Přejděte na kartu <strong>"Pozvánky"</strong>
                  </Text>
                </List.Item>
                <List.Item>
                  <Text>
                    Najděte vaši aplikaci a klikněte na tlačítko <strong>"Přijmout"</strong>
                  </Text>
                </List.Item>
              </List.Root>
              <Image
                src="/threads-account-permissions.png"
                alt="Threads aplikace - Účet a Oprávnění webu"
                mt={4}
                borderRadius="md"
                w="100%"
                maxW="100%"
                mx="auto"
              />
              <Image
                src="/threads-invitations.png"
                alt="Karta Pozvánky s aplikací a tlačítkem Přijmout"
                mt={4}
                borderRadius="md"
                w="100%"
                maxW="100%"
                mx="auto"
              />
            </Box>

            <Box bg={{ base: "white", _dark: "gray.800" }} p={6} borderRadius="lg" shadow="sm">
              <Heading size="md" mb={4} color={{ base: "gray.800", _dark: "white" }}>
                Krok 7: Generování Access Token
              </Heading>
              <List.Root as="ol" gap={3}>
                <List.Item>
                  <Text>
                    Vraťte se zpět do <strong>"Customize use case"</strong> → <strong>"Settings"</strong> na Meta for Developers
                  </Text>
                </List.Item>
                <List.Item>
                  <Text>
                    Klikněte na tlačítko <strong>"Generate Access Token"</strong>
                  </Text>
                </List.Item>
                <List.Item>
                  <Text>
                    Zkopírujte vygenerovaný Access Token, který budete používat v aplikaci
                  </Text>
                </List.Item>
              </List.Root>
              <Image
                src="/threads-generate-token.png"
                alt="Settings s tlačítkem Generate Access Token"
                mt={4}
                borderRadius="md"
                w="100%"
                maxW="100%"
                mx="auto"
              />
            </Box>

            <Box
              p={3}
              bg={{ base: "green.50", _dark: "green.900" }}
              borderRadius="md"
              borderWidth="1px"
              borderColor={{ base: "green.200", _dark: "green.700" }}
              mt={4}
            >
              <Text fontSize="sm" color={{ base: "green.800", _dark: "green.200" }}>
                <strong>✅ Hotovo!</strong> Nyní máte Access Token pro Threads API, který můžete použít pro připojení vašeho Threads účtu k aplikaci.
              </Text>
            </Box>

            <Box
              p={3}
              bg={{ base: "yellow.50", _dark: "yellow.900" }}
              borderRadius="md"
              borderWidth="1px"
              borderColor={{ base: "yellow.200", _dark: "yellow.700" }}
            >
              <Text fontSize="sm" color={{ base: "yellow.800", _dark: "yellow.200" }}>
                <strong>⚠️ Poznámka:</strong> Threads API je relativně nové. Ujistěte se, že máte správné oprávnění a že vaše aplikace splňuje požadavky Meta. Access Token uchovávejte v bezpečí.
              </Text>
            </Box>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
};

export default HelpThreadsPage;
