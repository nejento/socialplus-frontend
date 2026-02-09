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
  Link,
} from '@chakra-ui/react';

const HelpFacebookPage: React.FC = () => {
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
            Návod: Nastavení Facebook API
          </Heading>

          <VStack spacing={8} align="stretch">
            <Alert status="info">
              <AlertIcon />
              <Text>
                Pro připojení Facebook stránky potřebujete vytvořit Facebook App a získat potřebné přístupové údaje. Proces je komplexnější než u jiných platforem.
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
                    <strong>Tip:</strong> Pokud už máte aplikaci pro Threads API, můžete jen rozšířit Use case bez potřeby vytvářet další aplikaci
                  </Text>
                </ListItem>
                <ListItem>
                  <Text>
                    Na stránce "Add use cases" vyberte možnost <strong>"Manage everything on your Page"</strong>
                  </Text>
                </ListItem>
                <ListItem>
                  <Text>
                    Pokud se zobrazí stránka pro připojení business portfólia, není nutné portfólio připojovat - můžete pokračovat bez něj
                  </Text>
                </ListItem>
                <ListItem>
                  <Text>
                    Zbytek formuláře můžete vyplnit podle potřeby a pokračovat tlačítky na další kroky
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
                Krok 2: Výběr use case
              </Heading>
              <Text mb={4}>
                Na stránce s výběrem use cases vyberte správnou možnost pro správu stránek.
              </Text>
              <Image
                src="/facebook-use-cases.png"
                alt="Stránka s výběrem Add use cases - zvýrazněno Manage everything on your Page"
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
                    V sekci <strong>"Permissions and features"</strong> zkontrolujte přítomnost těchto oprávnění:
                  </Text>
                  <OrderedList mt={2} ml={4}>
                    <ListItem>
                      <Text><strong>pages_manage_posts</strong> - pro publikování příspěvků</Text>
                    </ListItem>
                    <ListItem>
                      <Text><strong>pages_read_engagement</strong> - pro čtení statistik</Text>
                    </ListItem>
                  </OrderedList>
                </ListItem>
                <ListItem>
                  <Text>
                    Pokud některé oprávnění není "Ready for testing", klikněte na tlačítko <strong>"Add"</strong> vedle něj
                  </Text>
                </ListItem>
              </OrderedList>
              <Image
                src="/facebook-permissions.png"
                alt="Dashboard s Configure use case a zvýrazněnými oprávněními"
                mt={4}
                borderRadius="md"
                w="100%"
                maxW="100%"
                mx="auto"
              />
            </Box>

            <Box bg={cardBg} p={6} borderRadius="lg" shadow="sm">
              <Heading size="md" mb={4} color={textColor}>
                Krok 4: Generování Access Token
              </Heading>
              <OrderedList spacing={3}>
                <ListItem>
                  <Text>
                    Přejděte na <Link href="https://developers.facebook.com/tools/explorer/" isExternal color="blue.500" textDecoration="underline">
                      Graph API Explorer
                    </Link>
                  </Text>
                </ListItem>
                <ListItem>
                  <Text>
                    Ve výběru <strong>"Meta App"</strong> zvolte vaši vytvořenou aplikaci
                  </Text>
                </ListItem>
                <ListItem>
                  <Text>
                    Ve výběru <strong>"User or Page"</strong> zvolte <strong>"Get User Access Token"</strong>
                  </Text>
                </ListItem>
                <ListItem>
                  <Text>
                    Klikněte na <strong>"Generate Access Token"</strong>
                  </Text>
                </ListItem>
              </OrderedList>
              <Image
                src="/facebook-graph-explorer.png"
                alt="Graph API Explorer s nastaveními pro generování tokenu"
                mt={4}
                borderRadius="md"
                w="100%"
                maxW="100%"
                mx="auto"
              />
            </Box>

            <Box bg={cardBg} p={6} borderRadius="lg" shadow="sm">
              <Heading size="md" mb={4} color={textColor}>
                Krok 5: Výběr stránky a oprávnění
              </Heading>
              <OrderedList spacing={3}>
                <ListItem>
                  <Text>
                    Po kliknutí na "Generate Access Token" se zobrazí dialog pro výběr stránky
                  </Text>
                </ListItem>
                <ListItem>
                  <Text>
                    Vyberte stránku, kterou chcete spravovat přes aplikaci
                  </Text>
                </ListItem>
                <ListItem>
                  <Text>
                    Zkontrolujte, že jsou vybraná všechna potřebná oprávnění:
                  </Text>
                  <OrderedList mt={2} ml={4}>
                    <ListItem><Text><strong>pages_manage_posts</strong></Text></ListItem>
                    <ListItem><Text><strong>pages_read_engagement</strong></Text></ListItem>
                    <ListItem><Text><strong>pages_show_list</strong></Text></ListItem>
                  </OrderedList>
                </ListItem>
                <ListItem>
                  <Text>
                    Zkopírujte výsledný <strong>"Access Token"</strong>, který budete používat v aplikaci
                  </Text>
                </ListItem>
              </OrderedList>
              <Image
                src="/facebook-token-dialog.png"
                alt="Dialog pro výběr stránky a oprávnění"
                mt={4}
                borderRadius="md"
                w="100%"
                maxW="100%"
                mx="auto"
              />
              <Image
                src="/facebook-permission-dialog.png"
                alt="Dialog pro výběr oprávnění a získání Access Tokenu"
                mt={4}
                borderRadius="md"
                w="100%"
                maxW="100%"
                mx="auto"
              />
            </Box>

            <Box bg={cardBg} p={6} borderRadius="lg" shadow="sm">
              <Heading size="md" mb={4} color={textColor}>
                Dodatečné nastavení
              </Heading>
              <Text mb={4}>
              </Text>
                Pro získání App ID a App secret využijte menu v <strong>"App settings"</strong> → <strong>"Basic"</strong> na Meta for Developers dashboardu.
                <Image
                src="/facebook-app-settings.png"
                alt="Menu App settings a Basic v Meta for Developers dashboardu"
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
                <strong>Hotovo!</strong> Nyní máte Access Token, který můžete použít pro připojení vaší Facebook stránky k aplikaci.
              </Text>
            </Alert>

            <Alert status="warning">
              <AlertIcon />
              <Text>
                <strong>Důležité:</strong> Access Token uchovávejte v bezpečí a nikdy jej nesdílejte veřejně. Facebook má přísné bezpečnostní požadavky na své API.
              </Text>
            </Alert>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
};

export default HelpFacebookPage;
