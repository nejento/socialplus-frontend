# SocialPlus Frontend - Dokumentace

## Přehled aplikace

SocialPlus je React aplikace pro správu a plánování příspěvků na sociálních sítích. Aplikace umožňuje uživatelům vytvářet, editovat a plánovat příspěvky napříč různými sociálními platformami jako Facebook, Twitter, Mastodon, Bluesky a Threads.

## Technický stack

- **Frontend Framework**: React 18 s TypeScript
- **UI Framework**: Chakra UI
- **Routing**: React Router v6
- **State Management**: React Context API + TanStack Query (React Query)
- **HTTP Client**: Axios
- **Build Tool**: Vite

## Architektura aplikace

### Struktura složek

```
src/
├── components/           # Znovupoužitelné komponenty
│   ├── Layout/          # Layoutové komponenty (MainLayout, Sidebar)
│   └── *.tsx           # Ostatní komponenty (modály, karty, formuláře)
├── contexts/           # React Context providers
├── hooks/              # Vlastní React hooks
├── pages/              # Stránkové komponenty
├── services/           # API komunikace
├── types/              # TypeScript definice
└── theme.ts           # Chakra UI téma
```

## Hlavní komponenty aplikace

### 1. App.tsx - Hlavní komponenta aplikace

Hlavní komponenta, která obaluje celou aplikaci a poskytuje:

- **ChakraProvider**: UI framework provider s vlastním tématem
- **QueryClientProvider**: TanStack Query provider pro správu API stavu
- **AuthProvider**: Kontext pro autentizaci uživatelů
- **Router**: React Router pro správu URL tras
- **ErrorBoundary**: Globální error boundary pro zachycení chyb

#### Struktura providerů:
```
ChakraProvider
└── QueryClientProvider
    └── AuthProvider
        └── Router
            └── ErrorBoundary
                └── AppRoutes
```

### 2. Routing a ochrana tras

Aplikace implementuje dva typy tras:

#### PrivateRoute
- Chrání trasy před nepřihlášenými uživateli
- Přesměruje na `/login` pokud uživatel není autentizován
- Zobrazuje loading stav během ověřování

#### PublicRoute  
- Přesměruje přihlášené uživatele z login/register stránky
- Chrání před duplicitním přihlašováním

#### Struktura tras:
- **Veřejné trasy**: `/login`, `/register`
- **Help stránky**: `/help/facebook`, `/help/twitter`, `/help/threads`, `/help/mastodon`, `/help/bluesky`
- **Chráněné trasy s MainLayout**:
  - `/` - Domovská stránka
  - `/posts` - Seznam příspěvků
  - `/posts/new` - Vytvoření nového příspěvku
  - `/posts/edit/:id` - Editace příspěvku
  - `/posts/:id` - Detail příspěvku
  - `/calendar` - Kalendářový pohled
  - `/networks` - Správa sociálních sítí
  - `/networks/new` - Přidání nové sítě
  - `/networks/edit/:networkId` - Editace sítě

### 3. AuthContext - Správa autentizace

Kontext pro správu stavu přihlášení uživatele:

#### Funkcionality:
- **Session-based autentizace** pomocí HTTP cookies
- **Lokální cache** v localStorage pro rychlé načítání
- **Automatické ověření session** při startu aplikace
- **Správa loading stavů**

#### API metody:
- `login(username, password)` - Přihlášení uživatele
- `register(username, displayname, password)` - Registrace nového uživatele
- `logout()` - Odhlášení uživatele
- `checkAuthStatus()` - Ověření platnosti session

#### Stav kontextu:
```typescript
interface AuthContextType {
  user: User | null;          // Aktuální uživatel
  isLoading: boolean;         // Loading stav
  login: (username, password) => Promise<void>;
  register: (username, displayname, password) => Promise<void>;
  logout: () => Promise<void>;
}
```

### 4. Layout systém

#### MainLayout
Hlavní layout pro přihlášené uživatele obsahuje:
- **Responzivní design** (desktop sidebar, mobile drawer)
- **Sidebar navigaci** s hlavním menu
- **Obsahovou oblast** pro stránky
- **Error boundary** pro každou sekci

#### Sidebar
Navigační komponenta poskytuje:
- **Logo aplikace** (světlé/tmavé varianty)
- **Hlavní navigaci** (Domů, Příspěvky, Kalendář, Sociální sítě)
- **Uživatelské informace** a tlačítko odhlášení
- **Responzivní chování** (desktop fixed, mobile drawer)

## ErrorBoundary systém

### Globální Error Boundary
Aplikace implementuje víceúrovňový systém zachycení chyb:

1. **Globální Error Boundary** - obaluje celé AppRoutes
2. **Layout Error Boundaries** - v MainLayout pro sidebar a content
3. **Stránkové Error Boundaries** - pro kritické stránky (PostEditor, Calendar)

### Funkcionalita Error Boundary:
- **Zachycuje JavaScript chyby** v komponentách
- **Zobrazuje uživatelsky přívětivé chybové hlášky**
- **V development módu** zobrazuje detaily chyby
- **Možnost obnovení** stránky pro pokračování

## API komunikace

### Axios konfigurace
```typescript
const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,  // Pro session cookies
    headers: {
        'Content-Type': 'application/json',
    },
});
```

### API moduly:

#### authAPI
- Přihlašování, registrace, odhlašování
- Ověření session (`/user/me`)

#### postsAPI
- CRUD operace s příspěvky
- Správa obsahu a příloh
- Propojování s sociálními sítěmi
- Plánování a odesílání příspěvků
- Monitoring a statistiky

#### networkAPI
- Správa sociálních sítí
- Token management
- Permissions management

#### userAPI
- Uživatelské profily
- Vyhledávání uživatelů

### Error handling
- **401 Unauthorized**: Automatické vyčištění localStorage
- **Response interceptor** pro globální error handling
- **Bez automatického přesměrování** (ponecháno na AuthContext)

## State Management

### React Query (TanStack Query)
Konfigurace pro API state management:
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minut cache
    },
  },
});
```

### Lokální stav
- **React Context** pro globální stav (auth)
- **useState/useReducer** pro lokální stav komponent
- **localStorage** pro persistenci uživatelských dat

## Komponenty a jejich využití

### Hlavní stránkové komponenty:
- **HomePage** - Úvodní stránka s přehledem
- **PostsPage** - Seznam všech příspěvků
- **PostEditorPage** - Vytváření/editace příspěvků (obaleno ErrorBoundary)
- **PostDetailPage** - Detail konkrétního příspěvku
- **CalendarPage** - Kalendářový pohled na příspěvky (obaleno ErrorBoundary)
- **NetworksPage** - Správa sociálních sítí
- **NetworkEditPage** - Vytváření/editace sítí
- **LoginPage** - Přihlašování a registrace

### Help stránky:
- **HelpFacebookPage, HelpTwitterPage, HelpThreadsPage, HelpMastodonPage, HelpBlueskyPage** - Dokumentace pro jednotlivé sociální sítě

### Znovupoužitelné komponenty:
- **PostCard** - Karta příspěvku v seznamu
- **NetworkCard** - Karta sociální sítě
- **ConfirmationModal** - Potvrzovací dialogy
- **DeletePostModal, DeleteNetworkModal** - Specializované dialogy pro mazání
- **NetworkSelector** - Výběr sociálních sítí
- **FileAttachment** - Zobrazení příloh

## Typy a interfaces

### Hlavní typy:
```typescript
// Uživatel
interface User {
    id: number;
    username: string;
    displayname: string;
}

// Sociální síť
interface NetworkInfo {
    id: number;
    networkType: NetworkType;
    networkName: string;
    owner: User;
    permission: 'admin' | 'write' | 'read';
}

// Příspěvek
interface PostCardData {
    postId: number;
    creator: User;
    createdAt: string;
    firstContent?: string;
    contents?: PostContent[];
    attachments?: Attachment[];
}
```

### Podporované sociální sítě:
```typescript
type NetworkType = 'facebook' | 'twitter' | 'mastodon' | 'bluesky' | 'threads';
```

## Bezpečnost

### Autentizace
- **Session-based** autentizace s HTTP-only cookies
- **CSRF ochrana** pomocí withCredentials
- **Automatické ověření session** při načtení aplikace

### Autorizace
- **Role-based přístup** k sociálním sítím (admin/write/read)
- **Ochrana tras** pomocí PrivateRoute
- **Podmíněné zobrazování** funkcionalit dle oprávnění

## Development a Build

### Vite konfigurace
- **Hot Module Replacement** pro rychlý development
- **TypeScript podpora** s type checkingem
- **Environment variables** pro API URL konfiguraci

### Environment variables:
- `VITE_API_URL` - URL backend API serveru

### Build proces:
```bash
npm run build  # Production build
npm run dev    # Development server
```

## Monitoring a Error tracking

### Konzole logging
- **API chyby** jsou logovány do konzole
- **Development mode** zobrazuje detailní chybové zprávy
- **Auth flow** obsahuje debug výstupy

### Error Boundaries
- **Hierarchické zachycení chyb** na různých úrovních
- **Graceful degradation** při chybách komponent
- **Možnost recovery** bez reload celé aplikace
