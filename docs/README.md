# SocialPlus Frontend

## Přehled aplikace

SocialPlus je moderní React aplikace pro správu a publikování příspěvků na sociálních sítích. Aplikace umožňuje uživatelům vytvářet, editovat a plánovat příspěvky, spravovat své sociální sítě a sledovat analytics jejich publikací.

### Technický Stack

- **Frontend Framework**: React 19.1.1 s TypeScript 5.9.2
- **UI Library**: Chakra UI 2.10.9 s Emotion pro styling
- **State Management**: TanStack React Query 5.17.19 pro server state
- **HTTP Client**: Axios 1.6.5 s interceptory
- **Routing**: React Router 7.8.1
- **Build Tool**: Vite 7.1.2
- **Testing**: Vitest 3.2.4 s Testing Library
- **Form Management**: React Hook Form 7.49.3 s Hookform Resolvers
- **Charts**: Recharts 3.1.2 pro datové vizualizace
- **Icons**: React Icons 4.12.0 + Chakra UI Icons
- **Date Management**: date-fns 3.2.0
- **Animations**: Framer Motion 6.5.1

## Architektura aplikace

### Struktura projektu

```
src/
├── components/          # Reusable komponenty
│   ├── Layout/         # Layout komponenty (MainLayout, Sidebar)
│   ├── Modal/          # Modal dialogy
│   ├── UI/             # Základní UI komponenty
│   └── Feature/        # Feature-specific komponenty
├── contexts/           # React Context providers
├── hooks/              # Custom React hooks
├── pages/              # Page komponenty pro routing
├── services/           # API služby a HTTP client
├── types/              # TypeScript type definitions
├── utils/              # Utility funkce
├── theme.ts            # Chakra UI theme konfigurace
└── App.tsx             # Root aplikační komponenta
```

### Provider Stack (App.tsx)

Aplikace využívá hierarchii providerů pro globální state management:

```
ChakraProvider (UI theme)
├── QueryClientProvider (TanStack Query)
    ├── AuthProvider (Authentication context)
        ├── Router (React Router)
            └── ErrorBoundary (Error handling)
                └── AppRoutes (Route configuration)
```

## Routing a Layout systém

### Route Structure

Aplikace implementuje dvouúrovňový routing systém:

1. **Veřejné trasy** (bez autentifikace):
   - `/login` - Přihlašovací stránka
   - `/register` - Registrační stránka

2. **Help stránky** (s autentifikací, bez MainLayout):
   - `/help/facebook` - Facebook nápověda
   - `/help/twitter` - Twitter/X nápověda  
   - `/help/threads` - Threads nápověda
   - `/help/mastodon` - Mastodon nápověda
   - `/help/bluesky` - Bluesky nápověda

3. **Hlavní aplikace** (s autentifikací + MainLayout):
   - `/` - Domovská stránka (HomePage)
   - `/posts` - Seznam příspěvků (PostsPage)
   - `/posts/new` - Vytvoření nového příspěvku (PostEditorPage)
   - `/posts/edit/:id` - Editace příspěvku (PostEditorPage)
   - `/posts/:id` - Detail příspěvku (PostDetailPage)
   - `/calendar` - Kalendářní pohled (CalendarPage)
   - `/networks` - Správa sociálních sítí (NetworksPage)
   - `/networks/new` - Přidání nové sítě (NetworkEditPage)
   - `/networks/edit/:networkId` - Editace sítě (NetworkEditPage)

### Route Protection

- **PrivateRoute**: Ochrana tras pro přihlášené uživatele
- **PublicRoute**: Přesměrování přihlášených uživatelů z veřejných tras
- **Loading states**: Zobrazení loading stavu během ověřování autentifikace

### MainLayout komponenta

`MainLayout` je hlavní wrapper pro autentifikované stránky:

**Struktur**:
- **Flex container**: `minH="100vh"` pro full-height layout
- **Sidebar**: Levá navigační lišta (desktop) nebo drawer (mobile)
- **Main content area**: Flexibilní oblast pro page content
- **Mobile header**: Zobrazuje se pouze na mobilních zařízeních
- **ErrorBoundary**: Obaluje Sidebar pro izolaci chyb

**Responsive design**:
- Desktop: Sidebar fixní vlevo, content area vpravo
- Mobile: Hamburger menu v headeru, sidebar jako overlay drawer

## Sidebar navigace

`Sidebar` komponenta poskytuje hlavní navigaci aplikace:

**Navigační položky**:
- 🏠 Domů (`/`)
- 📝 Příspěvky (`/posts`)  
- 📅 Kalendář (`/calendar`)
- 🌐 Sociální sítě (`/networks`)

**Features**:
- **Active state highlighting**: Zvýraznění aktuální stránky
- **Logo display**: Dynamické logo podle color mode (light/dark)
- **User info**: Zobrazení přihlášeného uživatele
- **Logout functionality**: Odhlášení s error handlingem
- **Responsive behavior**: Desktop sidebar vs mobile drawer

## Autentifikace (AuthContext)

`AuthContext` poskytuje centralizovanou správu autentifikace:

### State Management
```typescript
interface AuthContextType {
  user: User | null;           // Aktuální uživatel
  isLoading: boolean;          // Loading state
  login: (username, password) => Promise<void>;
  register: (username, displayname, password) => Promise<void>;
  logout: () => Promise<void>;
}
```

### Session Management
- **Session verification**: Automatické ověření při načtení aplikace
- **LocalStorage sync**: Synchronizace user dat s localStorage
- **Automatic cleanup**: Vyčištění dat při neplatné session
- **Error handling**: Graceful handling chyb autentifikace

### Authentication Flow
1. **App load**: `checkAuthStatus()` ověří platnost session
2. **Login/Register**: API volání + uložení user dat
3. **Session verify**: Pravidelné ověřování pomocí `/user/me` endpoint
4. **Logout**: Vyčištění session + localStorage

## HTTP Client (services/api.ts)

Centralizovaný Axios client s konfigurací:

### Základní konfigurace
```typescript
const api = axios.create({
  baseURL: API_BASE_URL,        // Environment-based URL
  withCredentials: true,        // Session cookies support
  headers: { 'Content-Type': 'application/json' }
});
```

### Environment Configuration
- **Development**: `http://localhost:8080/api`
- **Production**: `/api` (relative path)
- **Custom**: `VITE_API_URL` environment variable

### Response Interceptor
- **401 Unauthorized**: Automatické vyčištění localStorage
- **Error propagation**: Předání chyb komponentám
- **Global error handling**: Centralizované zpracování HTTP chyb

### API Endpoints
```typescript
authAPI: {
  login(username, password)     // POST /login
  register(username, displayname, password) // POST /register  
  logout()                      // POST /logout
  verify()                      // GET /user/me
}
```

## Custom Hooks

### usePostData Hook

Komplexní hook pro správu dat příspěvků:

**State Management**:
- `postEditors`: Array PostEditor objektů (obsahy příspěvků)
- `availableNetworks`: Seznam dostupných sociálních sítí
- `selectedNetworksByContent`: Mapa ID content → selected network IDs
- `selectedNetworksByAttachment`: Mapa ID attachment → selected network IDs
- `postFiles`: Seznam nahraných souborů
- `schedulingDates`: Mapa network ID → plánovaný datum
- `existingSchedules`: Mapa network ID → existující schedule
- `sentNetworks`: Set odeslaných networkových ID

**Key Functions**:
- `loadAllPostData()`: Načtení všech dat příspěvku
- `getNetworkStyling()`: Helper pro network styling
- Network selection management
- File upload handling
- Schedule management

### useDeletePost Hook

Hook pro mazání příspěvků s optimistic updates:

**Features**:
- **Optimistic updates**: Okamžité UI update před API response
- **Error rollback**: Obnovení stavu při chybě
- **Toast notifications**: User feedback pro success/error
- **Query invalidation**: Refresh related queries po úspěšném smazání

## Utility Functions

### fileUtils.ts

Helper funkce pro práci se soubory:

**formatFileSize(bytes)**:
- Konverze bytů na čitelný formát (B, KB, MB, GB, TB)
- Inteligentní zaokrouhlování (celá čísla vs. 1 desetinné místo)
- Optimalizace pro různé velikosti souborů

```typescript
formatFileSize(1024) // "1 KB"
formatFileSize(1536) // "1.5 KB" 
formatFileSize(1048576) // "1 MB"
```

## Error Handling

### ErrorBoundary komponenta

React Error Boundary pro graceful error handling:

**Implementation**:
- **Class-based component**: Využívá `componentDidCatch`
- **Fallback UI**: Uživatelsky přívětivé chybové hlášky
- **Error isolation**: Izolace chyb na úroveň komponent
- **Development vs Production**: Různé chybové zprávy

**Usage**:
- Obaluje kritické komponenty (PostEditor, Calendar, atd.)
- Zabráněuje crash celé aplikace při chybě komponenty
- Umístěna na strategických místech v route definicích

### Global Error Handling

**Axios Interceptor**:
- Automatické zpracování 401 chyb
- Cleanup authentication state
- Error propagation k React Query

**React Query Error Handling**:
- Default retry: 1 pokus
- Stale time: 5 minut
- Automatic error states v UI

## State Management

### Server State (React Query)

**QueryClient konfigurace**:
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,                     // Počet retry při chybě
      staleTime: 5 * 60 * 1000,    // Data fresh 5 minut
      refetchOnWindowFocus: false,  // Disable refetch při focus
    },
  },
});
```

**Klíčové výhody**:
- **Automatic caching**: Inteligentní cache management
- **Background updates**: Automatic refetch stale dat
- **Optimistic updates**: UI updates před API response  
- **Error handling**: Built-in error states
- **Loading states**: Automatic loading indikátory

### Client State (React Context)

**AuthContext**: Globální authentication state
**Component State**: Lokální state pomocí useState/useReducer

## Komponenty

### Layout komponenty

**MainLayout**:
- Hlavní wrapper pro autentifikované stránky
- Responsive design (desktop sidebar, mobile drawer)
- Integration s ErrorBoundary
- Loading states během auth verification

**Sidebar**:
- Hlavní navigace aplikace
- Active state management
- User info display
- Responsive behavior (desktop vs mobile)
- Logout functionality

### Feature komponenty

**PostCard**: Zobrazení individual příspěvku
**PostEditor**: Komplexní editor pro vytváření/editaci příspěvků
**NetworkCard**: Zobrazení info o sociální síti
**NetworkSelector**: Výběr sociálních sítí pro publikování
**FileAttachment**: Zobrazení a management příloh
**SchedulingSection**: Plánování publikace příspěvků

### Modal komponenty

**CreateNetworkModal**: Dialog pro vytvoření nové sítě
**DeleteNetworkModal**: Potvrzovací dialog pro smazání sítě
**DeletePostModal**: Potvrzovací dialog pro smazání příspěvku
**NetworkTokenModal**: Dialog pro konfiguraci API tokenů
**UserPermissionModal**: Správa uživatelských oprávnění

### UI komponenty

**ConfirmationModal**: Obecný potvrzovací dialog
**SaveStatusIndicator**: Indikátor stavu ukládání
**ErrorBoundary**: Error handling wrapper

## Pages (Stránky)

### HomePage
- Dashboard s přehledem aktivity
- Quick actions pro časté úkoly
- Statistics a metriky

### PostsPage  
- Seznam všech příspěvků
- Filtering a searching
- Bulk operations
- Pagination

### PostEditorPage
- Komplexní editor pro vytváření/editaci příspěvků
- Multiple content blocks
- File attachments
- Network selection
- Scheduling functionality
- Preview mode

### PostDetailPage
- Detailní zobrazení jednotlivého příspěvku
- Analytics a metriky
- Comments/engagement data
- Edit/delete actions

### NetworksPage
- Správa připojených sociálních sítí
- Network status monitoring
- Configuration management
- Add/remove networks

### NetworkEditPage
- Konfigurace individual sociální sítě
- API token management
- Permission settings
- Connection testing

### CalendarPage
- Kalendářní zobrazení naplánovaných příspěvků
- Drag & drop scheduling
- Timeline view
- Batch operations

### Help Pages
- Platform-specific nápovědy pro:
  - Facebook integration
  - Twitter/X setup
  - Threads configuration
  - Mastodon connection
  - Bluesky integration

## Performance Optimalizace

### Implementované optimalizace

1. **React.memo()**: Komponenty memoizovány pro prevenci zbytečných re-renderů
2. **useMemo/useCallback**: Optimalizace expensive computations
3. **Lazy loading**: Code splitting pro routes
4. **Image optimization**: Optimalizace obrázků a assets
5. **Bundle splitting**: Vite automatické code splitting

### React Query optimalizace

- **Stale time**: 5 minut pro redukci network requests
- **Cache management**: Automatic garbage collection
- **Background refetching**: Smart data synchronization
- **Optimistic updates**: Immediate UI response

## Development a Build

### Scripts
- `npm run dev`: Development server (Vite)
- `npm run build`: Production build (TypeScript + Vite)
- `npm run preview`: Preview production build
- `npm test`: Run tests (Vitest)
- `npm run deploy`: Build a deploy na GitHub Pages

### Environment Configuration
- `VITE_API_URL`: Backend API URL
- Development: Automatic proxy setup
- Production: Relative API paths

### Testing
- **Vitest**: Unit a integration testy
- **Testing Library**: Component testing utilities
- **Jest DOM**: Additional DOM matchers

## Deployment

Aplikace je nakonfigurována pro deployment na GitHub Pages:

1. **Build process**: TypeScript compilation + Vite bundling
2. **Static assets**: Kopírování public assets
3. **GitHub Pages**: Automatic deployment při push do main
4. **Fallback routing**: SPA routing support

---

## Shrnutí architektury

SocialPlus frontend je moderní React aplikace s důrazem na:

- **Type Safety**: Kompletní TypeScript coverage
- **Performance**: Optimalizace na všech úrovních
- **User Experience**: Responsive design a intuitive UI
- **Error Handling**: Graceful degradation při chybách
- **Maintainability**: Čistá architektura a separation of concerns
- **Scalability**: Modulární struktura pro budoucí rozšíření

Aplikace využívá best practices moderního React vývoje s důrazem na developer experience a end-user performance.
