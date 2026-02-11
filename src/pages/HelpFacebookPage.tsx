import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Image,
  List,
  Link
} from '@chakra-ui/react';

const HelpFacebookPage: React.FC = () => {
  return (
    <Box minH="100vh" bg={{ base: "gray.50", _dark: "gray.900" }} w="100%" maxW="100vw" overflow="hidden">
      <Box
        maxW={{ base: "100%", lg: "1400px" }}
        mx="auto"
        w="100%"
      >
        <Container maxW="4xl" py={8}>
          <Heading size="lg" color={{ base: "gray.800", _dark: "white" }} mb={8}>
            Návod: Nastavení Facebook API
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
                ℹ️ Pro připojení Facebook stránky potřebujete vytvořit Facebook App a získat potřebné přístupové údaje. Proces je komplexnější než u jiných platforem.
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
                    <strong>Tip:</strong> Pokud už máte aplikaci pro Threads API, můžete jen rozšířit Use case bez potřeby vytvářet další aplikaci
                  </Text>
                </List.Item>
                <List.Item>
                  <Text>
                    Na stránce "Add use cases" vyberte možnost <strong>"Manage everything on your Page"</strong>
                  </Text>
                </List.Item>
                <List.Item>
                  <Text>
                    Pokud se zobrazí stránka pro připojení business portfólia, není nutné portfólio připojovat - můžete pokračovat bez něj
                  </Text>
                </List.Item>
                <List.Item>
                  <Text>
                    Zbytek formuláře můžete vyplnit podle potřeby a pokračovat tlačítky na další kroky
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
                    V sekci <strong>"Permissions and features"</strong> zkontrolujte přítomnost těchto oprávnění:
                  </Text>
                  <List.Root as="ol" mt={2} ml={4}>
                    <List.Item>
                      <Text><strong>pages_manage_posts</strong> - pro publikování příspěvků</Text>
                    </List.Item>
                    <List.Item>
                      <Text><strong>pages_read_engagement</strong> - pro čtení statistik</Text>
                    </List.Item>
                  </List.Root>
                </List.Item>
                <List.Item>
                  <Text>
                    Pokud některé oprávnění není "Ready for testing", klikněte na tlačítko <strong>"Add"</strong> vedle něj
                  </Text>
                </List.Item>
              </List.Root>
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

            <Box bg={{ base: "white", _dark: "gray.800" }} p={6} borderRadius="lg" shadow="sm">
              <Heading size="md" mb={4} color={{ base: "gray.800", _dark: "white" }}>
                Krok 4: Generování Access Token
              </Heading>
              <List.Root as="ol" gap={3}>
                <List.Item>
                  <Text>
                    Přejděte na <Link href="https://developers.facebook.com/tools/explorer/" target="_blank" color="blue.500" textDecoration="underline">
                      Graph API Explorer
                    </Link>
                  </Text>
                </List.Item>
                <List.Item>
                  <Text>
                    Ve výběru <strong>"Meta App"</strong> zvolte vaši vytvořenou aplikaci
                  </Text>
                </List.Item>
                <List.Item>
                  <Text>
                    Ve výběru <strong>"User or Page"</strong> zvolte <strong>"Get User Access Token"</strong>
                  </Text>
                </List.Item>
                <List.Item>
                  <Text>
                    Klikněte na <strong>"Generate Access Token"</strong>
                  </Text>
                </List.Item>
              </List.Root>
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

            <Box bg={{ base: "white", _dark: "gray.800" }} p={6} borderRadius="lg" shadow="sm">
              <Heading size="md" mb={4} color={{ base: "gray.800", _dark: "white" }}>
                Krok 5: Výběr stránky a oprávnění
              </Heading>
              <List.Root as="ol" gap={3}>
                <List.Item>
                  <Text>
                    Po kliknutí na "Generate Access Token" se zobrazí dialog pro výběr stránky
                  </Text>
                </List.Item>
                <List.Item>
                  <Text>
                    Vyberte stránku, kterou chcete spravovat přes aplikaci
                  </Text>
                </List.Item>
                <List.Item>
                  <Text>
                    Zkontrolujte, že jsou vybraná všechna potřebná oprávnění:
                  </Text>
                  <List.Root as="ol" mt={2} ml={4}>
                    <List.Item><Text><strong>pages_manage_posts</strong></Text></List.Item>
                    <List.Item><Text><strong>pages_read_engagement</strong></Text></List.Item>
                    <List.Item><Text><strong>pages_show_list</strong></Text></List.Item>
                  </List.Root>
                </List.Item>
                <List.Item>
                  <Text>
                    Zkopírujte výsledný <strong>"Access Token"</strong>, který budete používat v aplikaci
                  </Text>
                </List.Item>
              </List.Root>
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

            <Box bg={{ base: "white", _dark: "gray.800" }} p={6} borderRadius="lg" shadow="sm">
              <Heading size="md" mb={4} color={{ base: "gray.800", _dark: "white" }}>
                Dodatečné nastavení
              </Heading>
              <Text mb={4}>
                Pro získání App ID a App secret využijte menu v <strong>"App settings"</strong> → <strong>"Basic"</strong> na Meta for Developers dashboardu.
              </Text>
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

            <Box
              p={3}
              bg={{ base: "green.50", _dark: "green.900" }}
              borderRadius="md"
              borderWidth="1px"
              borderColor={{ base: "green.200", _dark: "green.700" }}
              mt={4}
            >
              <Text fontSize="sm" color={{ base: "green.800", _dark: "green.200" }}>
                <strong>✅ Hotovo!</strong> Nyní máte Access Token, který můžete použít pro připojení vaší Facebook stránky k aplikaci.
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
                <strong>⚠️ Důležité:</strong> Access Token uchovávejte v bezpečí a nikdy jej nesdílejte veřejně. Facebook má přísné bezpečnostní požadavky na své API.
              </Text>
            </Box>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
};

export default HelpFacebookPage;
