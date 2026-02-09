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

const HelpThreadsPage: React.FC = () => {
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
            Návod: Nastavení Meta Threads API
          </Heading>

          <VStack spacing={8} align="stretch">
            <Alert status="info">
              <AlertIcon />
              <Text>
                Pro připojení Threads účtu potřebujete vytvořit Facebook App s přístupem k Threads API. Proces je podobný jako u Facebook API.
              </Text>
            </Alert>

            <Box bg={cardBg} p={6} borderRadius="lg" shadow="sm">
              <Heading size="md" mb={4} color={textColor}>
                Krok 1: Vytvoření Facebook App
              </Heading>
              <OrderedList spacing={3}>
                <ListItem>
                  <Text>
                    Přejděte na <strong>Meta for Developers</strong> portál (<strong>developers.facebook.com</strong>) a klikněte na tlačítko <strong>"Create App"</strong>
                  </Text>
                </ListItem>
                <ListItem>
                  <Text>
                    <strong>Tip:</strong> Pokud už máte aplikaci pro Facebook Pages, můžete jen rozšířit Use case bez potřeby vytvářet další aplikaci
                  </Text>
                </ListItem>
                <ListItem>
                  <Text>
                    Proces vytvoření aplikace je stejný jako u Facebook API
                  </Text>
                </ListItem>
              </OrderedList>
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

            <Box bg={cardBg} p={6} borderRadius="lg" shadow="sm">
              <Heading size="md" mb={4} color={textColor}>
                Krok 2: Výběr Threads API use case
              </Heading>
              <OrderedList spacing={3}>
                <ListItem>
                  <Text>
                    Na stránce "Add use cases" vyberte možnost <strong>"Access the Threads API"</strong>
                  </Text>
                </ListItem>
                <ListItem>
                  <Text>
                    Tato možnost umožní přístup k Threads platformě pro publikování a správu obsahu
                  </Text>
                </ListItem>
              </OrderedList>
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

            <Box bg={cardBg} p={6} borderRadius="lg" shadow="sm">
              <Heading size="md" mb={4} color={textColor}>
                Krok 3: Konfigurace oprávnění
              </Heading>
              <OrderedList spacing={3}>
                <ListItem>
                  <Text>
                    V dashboardu aplikace přejděte na <strong>"Customize use case"</strong>
                  </Text>
                </ListItem>
                <ListItem>
                  <Text>
                    V sekci <strong>"Permissions and features"</strong> nastavte tato oprávnění:
                  </Text>
                  <OrderedList mt={2} ml={4}>
                    <ListItem>
                      <Text><strong>threads_basic</strong> - základní přístup k Threads</Text>
                    </ListItem>
                    <ListItem>
                      <Text><strong>threads_content_publish</strong> - publikování obsahu na Threads</Text>
                    </ListItem>
                  </OrderedList>
                </ListItem>
              </OrderedList>
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

            <Box bg={cardBg} p={6} borderRadius="lg" shadow="sm">
              <Heading size="md" mb={4} color={textColor}>
                Krok 4: Získání App ID a App Secret
              </Heading>
              <OrderedList spacing={3}>
                <ListItem>
                  <Text>
                    V "Customize use case" přejděte do sekce <strong>"Settings"</strong>
                  </Text>
                </ListItem>
                <ListItem>
                  <Text>
                    Zde najdete důležité údaje pro aplikaci:
                  </Text>
                  <OrderedList mt={2} ml={4}>
                    <ListItem>
                      <Text><strong>Threads app ID</strong> - identifikátor aplikace</Text>
                    </ListItem>
                    <ListItem>
                      <Text><strong>Threads app secret</strong> - tajný klíč aplikace</Text>
                    </ListItem>
                  </OrderedList>
                </ListItem>
                <ListItem>
                  <Text>
                    Tyto údaje si poznamenejte, budete je potřebovat pro konfiguraci aplikace
                  </Text>
                </ListItem>
              </OrderedList>
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

            <Box bg={cardBg} p={6} borderRadius="lg" shadow="sm">
              <Heading size="md" mb={4} color={textColor}>
                Krok 5: Přidání Threads Tester uživatele
              </Heading>
              <OrderedList spacing={3}>
                <ListItem>
                  <Text>
                    V menu aplikace přejděte na <strong>"App roles"</strong> → <strong>"Roles"</strong>
                  </Text>
                </ListItem>
                <ListItem>
                  <Text>
                    Klikněte na tlačítko <strong>"Add People"</strong>
                  </Text>
                </ListItem>
                <ListItem>
                  <Text>
                    Přidejte vaše uživatelské jméno (handle) z Threads jako testera
                  </Text>
                </ListItem>
                <ListItem>
                  <Text>
                    Tento krok je nutný pro testování aplikace s vaším Threads účtem
                  </Text>
                </ListItem>
              </OrderedList>
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

            <Box bg={cardBg} p={6} borderRadius="lg" shadow="sm">
              <Heading size="md" mb={4} color={textColor}>
                Krok 6: Schválení v Threads aplikaci
              </Heading>
              <OrderedList spacing={3}>
                <ListItem>
                  <Text>
                    Otevřete Threads aplikaci a přejděte do <strong>"Účet"</strong> → <strong>"Oprávnění webu"</strong>
                  </Text>
                </ListItem>
                <ListItem>
                  <Text>
                    Přejděte na kartu <strong>"Pozvánky"</strong>
                  </Text>
                </ListItem>
                <ListItem>
                  <Text>
                    Najděte vaši aplikaci a klikněte na tlačítko <strong>"Přijmout"</strong>
                  </Text>
                </ListItem>
              </OrderedList>
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

            <Box bg={cardBg} p={6} borderRadius="lg" shadow="sm">
              <Heading size="md" mb={4} color={textColor}>
                Krok 7: Generování Access Token
              </Heading>
              <OrderedList spacing={3}>
                <ListItem>
                  <Text>
                    Vraťte se zpět do <strong>"Customize use case"</strong> → <strong>"Settings"</strong> na Meta for Developers
                  </Text>
                </ListItem>
                <ListItem>
                  <Text>
                    Klikněte na tlačítko <strong>"Generate Access Token"</strong>
                  </Text>
                </ListItem>
                <ListItem>
                  <Text>
                    Zkopírujte vygenerovaný Access Token, který budete používat v aplikaci
                  </Text>
                </ListItem>
              </OrderedList>
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

            <Alert status="success" mt={4}>
              <AlertIcon />
              <Text>
                <strong>Hotovo!</strong> Nyní máte Access Token pro Threads API, který můžete použít pro připojení vašeho Threads účtu k aplikaci.
              </Text>
            </Alert>

            <Alert status="warning">
              <AlertIcon />
              <Text>
                <strong>Poznámka:</strong> Threads API je relativně nové. Ujistěte se, že máte správné oprávnění a že vaše aplikace splňuje požadavky Meta. Access Token uchovávejte v bezpečí.
              </Text>
            </Alert>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
};

export default HelpThreadsPage;
