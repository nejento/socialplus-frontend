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

const HelpMastodonPage: React.FC = () => {
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
            Návod: Nastavení Mastodon API
          </Heading>

          <VStack spacing={8} align="stretch">
            <Alert status="info">
              <AlertIcon />
              <Text>
                Pro připojení Mastodon účtu potřebujete vytvořit aplikaci na vaší Mastodon instanci a získat přístupové tokeny.
              </Text>
            </Alert>

            <Box bg={cardBg} p={6} borderRadius="lg" shadow="sm">
              <Heading size="md" mb={4} color={textColor}>
                Krok 1: Přejděte do nastavení vývoje
              </Heading>
              <OrderedList spacing={3}>
                <ListItem>
                  <Text>
                    Přihlaste se na vaši Mastodon instanci (např. mastodon.social, mastodon.cz, nebo jakoukoliv jinou)
                  </Text>
                </ListItem>
                <ListItem>
                  <Text>
                    V pravém horním rohu klikněte na své profilové foto a vyberte "Předvolby" nebo "Preferences"
                  </Text>
                </ListItem>
                <ListItem>
                  <Text>
                    V levém menu najděte sekci "Vývoj" nebo "Development" a klikněte na ni
                  </Text>
                </ListItem>
                <ListItem>
                  <Text>
                    Na stránce vývoje klikněte na tlačítko "Nová aplikace" pro vytvoření nové API aplikace
                  </Text>
                </ListItem>
              </OrderedList>
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

            <Box bg={cardBg} p={6} borderRadius="lg" shadow="sm">
              <Heading size="md" mb={4} color={textColor}>
                Krok 2: Konfigurace nové aplikace
              </Heading>
              <OrderedList spacing={3}>
                <ListItem>
                  <Text>
                    <strong>Název aplikace:</strong> Zadejte název vaší aplikace (např. "SocialPlus", "Můj Mastodon klient")
                  </Text>
                </ListItem>
                <ListItem>
                  <Text>
                    <strong>URI přesměrování:</strong> Nechte výchozí hodnotu "urn:ietf:wg:oauth:2.0:oob" - neměňte ji!
                  </Text>
                </ListItem>
                <ListItem>
                  <Text>
                    <strong>Rozsahy oprávnění:</strong> Zaškrtněte následující oprávnění:
                  </Text>
                  <OrderedList spacing={2} mt={2} ml={4}>
                    <ListItem>
                      <Text><strong>read</strong> - pro čtení příspěvků a informací o účtu</Text>
                    </ListItem>
                    <ListItem>
                      <Text><strong>write</strong> - pro publikování příspěvků a interakci</Text>
                    </ListItem>
                  </OrderedList>
                </ListItem>
                <ListItem>
                  <Text>
                    Klikněte na "Odeslat" nebo "Submit" pro vytvoření aplikace
                  </Text>
                </ListItem>
              </OrderedList>
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

            <Box bg={cardBg} p={6} borderRadius="lg" shadow="sm">
              <Heading size="md" mb={4} color={textColor}>
                Krok 3: Získání přístupového tokenu
              </Heading>
              <Text mb={4}>
                Po úspešném vytvoření aplikace budete přesměrováni na stránku s detaily aplikace, kde najdete:
              </Text>
              <OrderedList spacing={3}>
                <ListItem>
                  <Text>
                    <strong>Váš přístupový token (Access token):</strong> Tento token budete potřebovat pro připojení k API
                  </Text>
                </ListItem>
                <ListItem>
                  <Text>
                    Zkopírujte tento token a uložte si ho - budete ho zadávat do aplikace pro připojení vašeho Mastodon účtu
                  </Text>
                </ListItem>
              </OrderedList>
              <Alert status="warning" mt={4}>
                <AlertIcon />
                <Text>
                  <strong>Důležité:</strong> Tento přístupový token uchovávejte v bezpečí a nikdy ho nesdílejte veřejně. Kdokoliv s tímto tokenem může přistupovat k vašemu Mastodon účtu.
                </Text>
              </Alert>
            </Box>

            <Alert status="success">
              <AlertIcon />
              <Text>
                Mastodon je decentralizovaná síť. Každá instance může mít mírně odlišné nastavení, ale obecný postup zůstává stejný.
              </Text>
            </Alert>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
};

export default HelpMastodonPage;
