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

const HelpTwitterPage: React.FC = () => {
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
                        Návod: Nastavení X (Twitter) API
                    </Heading>

                    <VStack spacing={8} align="stretch">
                        <Alert status="info">
                            <AlertIcon />
                            <Text>
                                Pro připojení X (Twitter) účtu potřebujete vytvořit Developer účet a získat API klíče. Proces je složitější než u ostatních platforem.
                            </Text>
                        </Alert>

                        <Box bg={cardBg} p={6} borderRadius="lg" shadow="sm">
                            <Heading size="md" mb={4} color={textColor}>
                                Krok 1: Registrace do X Developer Portal
                            </Heading>
                            <OrderedList spacing={3}>
                                <ListItem>
                                    <Text>
                                        Přejděte na <strong>developer.x.com</strong> (bývalý developer.twitter.com)
                                    </Text>
                                </ListItem>
                                <ListItem>
                                    <Text>
                                        Na hlavní stránce Developer Portal najděte sekci s tiery přístupu
                                    </Text>
                                </ListItem>
                                <ListItem>
                                    <Text>
                                        U tieru <strong>Free</strong> klikněte na tlačítko <strong>"Get started"</strong>
                                    </Text>
                                </ListItem>
                            </OrderedList>
                            <Image
                                src="/x-developer-portal-free.png"
                                alt="X Developer Portal s zvýrazněným tlačítkem Get started u Free tieru"
                                mt={4}
                                borderRadius="md"
                                w="100%"
                                maxW="100%"
                                mx="auto"
                            />
                        </Box>

                        <Box bg={cardBg} p={6} borderRadius="lg" shadow="sm">
                            <Heading size="md" mb={4} color={textColor}>
                                Krok 2: Vyplnění základních údajů
                            </Heading>
                            <OrderedList spacing={3}>
                                <ListItem>
                                    <Text>
                                        <strong>Země původu:</strong> Vyberte svou zemi
                                    </Text>
                                </ListItem>
                                <ListItem>
                                    <Text>
                                        <strong>Use case:</strong> Vyberte <strong>"Making a bot"</strong>
                                    </Text>
                                </ListItem>
                                <ListItem>
                                    <Text>
                                        U otázky "Will you make Twitter content or derived information available to a government entity...?" vyberte <strong>No</strong>
                                    </Text>
                                </ListItem>
                                <ListItem>
                                    <Text>
                                        Klikněte na <strong>"Let's do this"</strong>
                                    </Text>
                                </ListItem>
                            </OrderedList>
                            <Image
                                src="/x-developer-form-basic.png"
                                alt="Formulář s vyplněnými základními údaji pro X Developer účet"
                                mt={4}
                                borderRadius="md"
                                w="100%"
                                maxW="100%"
                                mx="auto"
                            />
                        </Box>

                        <Box bg={cardBg} p={6} borderRadius="lg" shadow="sm">
                            <Heading size="md" mb={4} color={textColor}>
                                Krok 3: Potvrzení Free Account
                            </Heading>
                            <OrderedList spacing={3}>
                                <ListItem>
                                    <Text>
                                        Na upsellové stránce "Ready to build on X" najděte sekci Free Account
                                    </Text>
                                </ListItem>
                                <ListItem>
                                    <Text>
                                        Klikněte na <strong>"Sign up for Free Account"</strong>
                                    </Text>
                                </ListItem>
                            </OrderedList>
                            <Image
                                src="/x-ready-to-build.png"
                                alt="Stránka Ready to build on X se zvýrazněným Sign up for Free Account"
                                mt={4}
                                borderRadius="md"
                                w="100%"
                                maxW="100%"
                                mx="auto"
                            />
                        </Box>

                        <Box bg={cardBg} p={6} borderRadius="lg" shadow="sm">
                            <Heading size="md" mb={4} color={textColor}>
                                Krok 4: Souhlas s podmínkami
                            </Heading>
                            <OrderedList spacing={3}>
                                <ListItem>
                                    <Text>
                                        Ve formuláři "Developer agreement & policy" zaškrtněte všechna požadovaná políčka
                                    </Text>
                                </ListItem>
                                <ListItem>
                                    <Text>
                                        <strong>Use cases aplikace:</strong> Vyplňte ve 250 znacích, jak budete API používat (např. "Bot pro správu sociálních médií, publikování příspěvků a sledování metrik.")
                                    </Text>
                                </ListItem>
                                <ListItem>
                                    <Text>
                                        Odešlete formulář
                                    </Text>
                                </ListItem>
                            </OrderedList>
                            <Image
                                src="/x-developer-agreement.png"
                                alt="Formulář Developer agreement s vyplněnými údaji a zaškrtnutými políčky"
                                mt={4}
                                borderRadius="md"
                                w="100%"
                                maxW="100%"
                                mx="auto"
                            />
                        </Box>

                        <Box bg={cardBg} p={6} borderRadius="lg" shadow="sm">
                            <Heading size="md" mb={4} color={textColor}>
                                Krok 5: Získání API Key a Secret
                            </Heading>
                            <OrderedList spacing={3}>
                                <ListItem>
                                    <Text>
                                        V Developer Portal přejděte do nastavení vašeho projektu
                                    </Text>
                                </ListItem>
                                <ListItem>
                                    <Text>
                                        Klikněte na kartu <strong>"Keys and Tokens"</strong>
                                    </Text>
                                </ListItem>
                                <ListItem>
                                    <Text>
                                        Zobrazí se modal s <strong>API Key</strong> a <strong>API Key Secret</strong> - zkopírujte a uložte si je
                                    </Text>
                                </ListItem>
                            </OrderedList>
                            <Image
                                src="/x-project-keys-tokens.png"
                                alt="Portál s nastavením projektu a zvýrazněnou kartou Keys and Tokens"
                                mt={4}
                                borderRadius="md"
                                w="100%"
                                maxW="100%"
                                mx="auto"
                            />
                            <Image
                                src="/x-api-key-modal.png"
                                alt="Modal s API Key a API Key Secret"
                                mt={4}
                                borderRadius="md"
                                w="100%"
                                maxW="100%"
                                mx="auto"
                            />
                        </Box>

                        <Box bg={cardBg} p={6} borderRadius="lg" shadow="sm">
                            <Heading size="md" mb={4} color={textColor}>
                                Krok 6: Nastavení OAuth 2.0
                            </Heading>
                            <OrderedList spacing={3}>
                                <ListItem>
                                    <Text>
                                        V sekci "User authentication settings" klikněte na tlačítko <strong>"Set up"</strong>
                                    </Text>
                                </ListItem>
                            </OrderedList>
                            <Image
                                src="/x-setup-oauth.png"
                                alt="Portál se zvýrazněným tlačítkem Set up v části User authentication settings"
                                mt={4}
                                borderRadius="md"
                                w="100%"
                                maxW="100%"
                                mx="auto"
                            />
                        </Box>

                        <Box bg={cardBg} p={6} borderRadius="lg" shadow="sm">
                            <Heading size="md" mb={4} color={textColor}>
                                Krok 7: Konfigurace OAuth aplikace
                            </Heading>
                            <OrderedList spacing={3}>
                                <ListItem>
                                    <Text>
                                        <strong>App Permissions:</strong> Nastavte na <strong>"Read and write"</strong>
                                    </Text>
                                </ListItem>
                                <ListItem>
                                    <Text>
                                        <strong>Type of App:</strong> Vyberte <strong>"Web App, Automated App or Bot"</strong>
                                    </Text>
                                </ListItem>
                                <ListItem>
                                    <Text>
                                        <strong>Callback URI:</strong> Zadejte <strong>"http://localhost"</strong>
                                    </Text>
                                </ListItem>
                                <ListItem>
                                    <Text>
                                        <strong>Website URL:</strong> Zadejte vaši doménu nebo například "https://google.com"
                                    </Text>
                                </ListItem>
                                <ListItem>
                                    <Text>
                                        Uložte nastavení
                                    </Text>
                                </ListItem>
                            </OrderedList>
                            <Image
                                src="/x-oauth-config-form.png"
                                alt="Formulář s nastavením OAuth aplikace - oprávnění, typ aplikace a URL adresy"
                                mt={4}
                                borderRadius="md"
                                w="100%"
                                maxW="100%"
                                mx="auto"
                            />
                        </Box>

                        <Box bg={cardBg} p={6} borderRadius="lg" shadow="sm">
                            <Heading size="md" mb={4} color={textColor}>
                                Krok 8: Získání OAuth 2.0 klíčů
                            </Heading>
                            <Text mb={4}>
                                Po nastavení OAuth se zobrazí stránka s finálními klíči:
                            </Text>
                            <OrderedList spacing={3}>
                                <ListItem>
                                    <Text>
                                        <strong>OAuth 2.0 Client ID</strong> - zkopírujte a uložte
                                    </Text>
                                </ListItem>
                                <ListItem>
                                    <Text>
                                        <strong>OAuth 2.0 Client Secret</strong> - zkopírujte a uložte
                                    </Text>
                                </ListItem>
                            </OrderedList>
                            <Image
                                src="/x-oauth-final-keys.png"
                                alt="Výsledná stránka s OAuth 2.0 Client ID a Client Secret"
                                mt={4}
                                borderRadius="md"
                                w="100%"
                                maxW="100%"
                                mx="auto"
                            />
                            <Alert status="success" mt={4}>
                                <AlertIcon />
                                <Text>
                                    <strong>Hotovo!</strong> Nyní máte všechny potřebné klíče: API Key, API Key Secret, Client ID a Client Secret.
                                </Text>
                            </Alert>
                        </Box>

                        <Alert status="warning">
                            <AlertIcon />
                            <Text>
                                <strong>Důležité:</strong> X API má přísné limity na počet požadavků v Free tieru. Uchovávejte všechny klíče v bezpečí a nikdy je nesdílejte veřejně.
                            </Text>
                        </Alert>
                    </VStack>
                </Container>
            </Box>
        </Box>
    );
};

export default HelpTwitterPage;
