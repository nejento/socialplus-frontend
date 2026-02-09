# SocialPlus Frontend

**Moderní React aplikace pro správu a publikování příspěvků na sociálních sítích**

SocialPlus umožňuje uživatelům vytvářet, editovat, plánovat a publikovat příspěvky napříč různými sociálními platformami z jednoho místa. Aplikace podporuje Facebook, Twitter/X, Threads, Mastodon a Bluesky.

## ✨ Hlavní funkce

- 📝 **Vytváření a editace příspěvků** - Bohatý editor s podporou textu, obrázků a příloh
- 📅 **Plánování publikací** - Kalendářní pohled a automatické publikování
- 🌐 **Správa sociálních sítí** - Centralizovaná správa všech připojených účtů
- 📊 **Analytics a statistiky** - Sledování výkonnosti příspěvků
- 📱 **Responsivní design** - Optimalizováno pro desktop i mobilní zařízení
- 🎨 **Tmavý/světlý režim** - Přepínání mezi barevnými schématy

## 🚀 Technologický stack

- **Frontend Framework**: React 19.1.1 s TypeScript 5.9.2
- **UI Library**: Chakra UI 2.10.9 s Emotion pro styling
- **State Management**: TanStack React Query 5.17.19
- **HTTP Client**: Axios 1.6.5
- **Routing**: React Router 7.8.1
- **Build Tool**: Vite 7.1.2
- **Form Management**: React Hook Form 7.49.3
- **Charts**: Recharts 3.1.2

## 🛠️ Instalace

### Požadavky

- **Node.js** 16.0 nebo vyšší
- **npm** 7.0 nebo vyšší (nebo **yarn** 1.22+)

### Základní instalace

1. **Naklonujte repozitář**
   ```bash
   git clone <repository-url>
   cd socialplus-frontend
   ```

2. **Nainstalujte závislosti**
   ```bash
   npm install
   ```

3. **Spusťte aplikaci v development módu**
   ```bash
   npm run dev
   ```

4. **Otevřete prohlížeč**
   
   Aplikace bude dostupná na [http://localhost:3000](http://localhost:3000)

## 📋 Dostupné skripty

### Development

```bash
# Spustí development server s hot reload
npm run dev
```

### Production

```bash
# Sestaví aplikaci pro produkci
npm run build
```

## 🏗️ Struktura projektu

```
src/
├── components/          # Reusable komponenty
│   ├── Layout/         # Layout komponenty (MainLayout, Sidebar)
│   ├── Modal/          # Modal dialogy
│   └── *.tsx           # Feature-specific komponenty
├── contexts/           # React Context providers
├── hooks/              # Custom React hooks
├── pages/              # Page komponenty pro routing
├── services/           # API služby a HTTP client
├── types/              # TypeScript type definitions
├── utils/              # Utility funkce
├── theme.ts            # Chakra UI theme konfigurace
└── App.tsx             # Root aplikační komponenta
```

## 🔐 Autentifikace

Aplikace využívá session-based autentifikaci. Pro přístup k funkcím je nutná registrace a přihlášení uživatele.

### Dostupné stránky

**Veřejné trasy:**
- `/login` - Přihlášení
- `/register` - Registrace

**Chráněné trasy:**
- `/` - Domovská stránka
- `/posts` - Seznam příspěvků
- `/posts/new` - Vytvoření nového příspěvku
- `/posts/edit/:id` - Editace příspěvku
- `/calendar` - Kalendářní pohled
- `/networks` - Správa sociálních sítí

**Help stránky:**
- `/help/facebook` - Facebook nápověda
- `/help/twitter` - Twitter/X nápověda
- `/help/threads` - Threads nápověda
- `/help/mastodon` - Mastodon nápověda
- `/help/bluesky` - Bluesky nápověda

## 🌐 Konfigurace prostředí

Vytvořte `.env` soubor v root adresáři s následujícími proměnnými:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## 📦 Deployment

```bash
npm run build
```

Build soubory najdete v `build/` složce.
