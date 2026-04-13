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

const HelpTwitterPage: React.FC = () => {
    return (
        <Box minH="100vh" bg={{ base: "gray.50", _dark: "gray.900" }} w="100%" maxW="100vw" overflow="hidden">
            <Box
                maxW={{ base: "100%", lg: "1400px" }}
                mx="auto"
                w="100%"
            >
                <Container maxW="4xl" py={8}>
                    <Heading size="lg" color={{ base: "gray.800", _dark: "white" }} mb={8}>
                        Návod: Nastavení X (Twitter) API
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
                                ℹ️ Pro připojení X (Twitter) účtu potřebujete vytvořit Developer účet a získat API klíče. Proces je složitější než u ostatních platforem.
                            </Text>
                        </Box>

                        <Box bg={{ base: "white", _dark: "gray.800" }} p={6} borderRadius="lg" shadow="sm">
                            <Heading size="md" mb={4} color={{ base: "gray.800", _dark: "white" }}>
                                Krok 1: Registrace do X Developer Portal
                            </Heading>
                            <List.Root as="ol" gap={3}>
                                <List.Item>
                                    <Text>
                                        Přejděte na <strong>developer.x.com</strong> (bývalý developer.twitter.com)
                                    </Text>
                                </List.Item>
                                <List.Item>
                                    <Text>
                                        Na hlavní stránce Developer Portal najděte sekci s tiery přístupu
                                    </Text>
                                </List.Item>
                                <List.Item>
                                    <Text>
                                        U tieru <strong>Free</strong> klikněte na tlačítko <strong>"Get started"</strong>
                                    </Text>
                                </List.Item>
                            </List.Root>
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

                        <Box bg={{ base: "white", _dark: "gray.800" }} p={6} borderRadius="lg" shadow="sm">
                            <Heading size="md" mb={4} color={{ base: "gray.800", _dark: "white" }}>
                                Krok 2: Vyplnění základních údajů
                            </Heading>
                            <List.Root as="ol" gap={3}>
                                <List.Item>
                                    <Text>
                                        <strong>Země původu:</strong> Vyberte svou zemi
                                    </Text>
                                </List.Item>
                                <List.Item>
                                    <Text>
                                        <strong>Use case:</strong> Vyberte <strong>"Making a bot"</strong>
                                    </Text>
                                </List.Item>
                                <List.Item>
                                    <Text>
                                        U otázky "Will you make Twitter content or derived information available to a government entity...?" vyberte <strong>No</strong>
                                    </Text>
                                </List.Item>
                                <List.Item>
                                    <Text>
                                        Klikněte na <strong>"Let's do this"</strong>
                                    </Text>
                                </List.Item>
                            </List.Root>
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

                        <Box bg={{ base: "white", _dark: "gray.800" }} p={6} borderRadius="lg" shadow="sm">
                            <Heading size="md" mb={4} color={{ base: "gray.800", _dark: "white" }}>
                                Krok 3: Potvrzení Free Account
                            </Heading>
                            <List.Root as="ol" gap={3}>
                                <List.Item>
                                    <Text>
                                        Na upsellové stránce "Ready to build on X" najděte sekci Free Account
                                    </Text>
                                </List.Item>
                                <List.Item>
                                    <Text>
                                        Klikněte na <strong>"Sign up for Free Account"</strong>
                                    </Text>
                                </List.Item>
                            </List.Root>
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

                        <Box bg={{ base: "white", _dark: "gray.800" }} p={6} borderRadius="lg" shadow="sm">
                            <Heading size="md" mb={4} color={{ base: "gray.800", _dark: "white" }}>
                                Krok 4: Souhlas s podmínkami
                            </Heading>
                            <List.Root as="ol" gap={3}>
                                <List.Item>
                                    <Text>
                                        Ve formuláři "Developer agreement & policy" zaškrtněte všechna požadovaná políčka
                                    </Text>
                                </List.Item>
                                <List.Item>
                                    <Text>
                                        <strong>Use cases aplikace:</strong> Vyplňte ve 250 znacích, jak budete API používat (např. "Bot pro správu sociálních médií, publikování příspěvků a sledování metrik.")
                                    </Text>
                                </List.Item>
                                <List.Item>
                                    <Text>
                                        Odešlete formulář
                                    </Text>
                                </List.Item>
                            </List.Root>
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

                        <Box bg={{ base: "white", _dark: "gray.800" }} p={6} borderRadius="lg" shadow="sm">
                            <Heading size="md" mb={4} color={{ base: "gray.800", _dark: "white" }}>
                                Krok 5: Získání API Key a Secret
                            </Heading>
                            <List.Root as="ol" gap={3}>
                                <List.Item>
                                    <Text>
                                        V Developer Portal přejděte do nastavení vašeho projektu
                                    </Text>
                                </List.Item>
                                <List.Item>
                                    <Text>
                                        Klikněte na kartu <strong>"Keys and Tokens"</strong>
                                    </Text>
                                </List.Item>
                                <List.Item>
                                    <Text>
                                        Zobrazí se modal s <strong>API Key</strong> a <strong>API Key Secret</strong> - zkopírujte a uložte si je
                                    </Text>
                                </List.Item>
                            </List.Root>
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

                        <Box bg={{ base: "white", _dark: "gray.800" }} p={6} borderRadius="lg" shadow="sm">
                            <Heading size="md" mb={4} color={{ base: "gray.800", _dark: "white" }}>
                                Krok 6: Nastavení OAuth 2.0
                            </Heading>
                            <List.Root as="ol" gap={3}>
                                <List.Item>
                                    <Text>
                                        V sekci "User authentication settings" klikněte na tlačítko <strong>"Set up"</strong>
                                    </Text>
                                </List.Item>
                            </List.Root>
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

                        <Box bg={{ base: "white", _dark: "gray.800" }} p={6} borderRadius="lg" shadow="sm">
                            <Heading size="md" mb={4} color={{ base: "gray.800", _dark: "white" }}>
                                Krok 7: Konfigurace OAuth aplikace
                            </Heading>
                            <List.Root as="ol" gap={3}>
                                <List.Item>
                                    <Text>
                                        <strong>App Permissions:</strong> Nastavte na <strong>"Read and write"</strong>
                                    </Text>
                                </List.Item>
                                <List.Item>
                                    <Text>
                                        <strong>Type of App:</strong> Vyberte <strong>"Web App, Automated App or Bot"</strong>
                                    </Text>
                                </List.Item>
                                <List.Item>
                                    <Text>
                                        <strong>Callback URI:</strong> Zadejte <strong>"http://localhost"</strong>
                                    </Text>
                                </List.Item>
                                <List.Item>
                                    <Text>
                                        <strong>Website URL:</strong> Zadejte vaši doménu nebo například "https://google.com"
                                    </Text>
                                </List.Item>
                                <List.Item>
                                    <Text>
                                        Uložte nastavení
                                    </Text>
                                </List.Item>
                            </List.Root>
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

                        <Box bg={{ base: "white", _dark: "gray.800" }} p={6} borderRadius="lg" shadow="sm">
                            <Heading size="md" mb={4} color={{ base: "gray.800", _dark: "white" }}>
                                Krok 8: Získání OAuth 2.0 klíčů
                            </Heading>
                            <Text mb={4}>
                                Po nastavení OAuth se zobrazí stránka s finálními klíči:
                            </Text>
                            <List.Root as="ol" gap={3}>
                                <List.Item>
                                    <Text>
                                        <strong>OAuth 2.0 Client ID</strong> - zkopírujte a uložte
                                    </Text>
                                </List.Item>
                                <List.Item>
                                    <Text>
                                        <strong>OAuth 2.0 Client Secret</strong> - zkopírujte a uložte
                                    </Text>
                                </List.Item>
                            </List.Root>
                            <Image
                                src="/x-oauth-final-keys.png"
                                alt="Výsledná stránka s OAuth 2.0 Client ID a Client Secret"
                                mt={4}
                                borderRadius="md"
                                w="100%"
                                maxW="100%"
                                mx="auto"
                            />
                            <Box
                                p={3}
                                bg={{ base: "green.50", _dark: "green.900" }}
                                borderRadius="md"
                                borderWidth="1px"
                                borderColor={{ base: "green.200", _dark: "green.700" }}
                                mt={4}
                            >
                                <Text fontSize="sm" color={{ base: "green.800", _dark: "green.200" }}>
                                    <strong>✅ Hotovo!</strong> Nyní máte všechny potřebné klíče: API Key, API Key Secret, Client ID a Client Secret.
                                </Text>
                            </Box>
                        </Box>

                        <Box
                            p={3}
                            bg={{ base: "yellow.50", _dark: "yellow.900" }}
                            borderRadius="md"
                            borderWidth="1px"
                            borderColor={{ base: "yellow.200", _dark: "yellow.700" }}
                        >
                            <Text fontSize="sm" color={{ base: "yellow.800", _dark: "yellow.200" }}>
                                <strong>⚠️ Důležité:</strong> X API má přísné limity na počet požadavků v Free tieru. Uchovávejte všechny klíče v bezpečí a nikdy je nesdílejte veřejně.
                            </Text>
                        </Box>
                    </VStack>
                </Container>
            </Box>
        </Box>
    );
};

export default HelpTwitterPage;
