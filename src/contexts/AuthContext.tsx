import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, displayname: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Při načtení aplikace zkontrolujeme, zda je uživatel přihlášený
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);

      // Nejprve zkontrolujeme, zda je v localStorage uložený uživatel
      const savedUser = localStorage.getItem('user');
      if (!savedUser) {
        setUser(null);
        return;
      }

      // Zkusíme ověřit session a získat aktuální data uživatele
      const response = await authAPI.verify();

      // Pokud je session platná, použijeme data ze serveru
      const userData = response.data;
      setUser(userData);

      // Aktualizujeme localStorage s nejnovějšími daty ze serveru
      localStorage.setItem('user', JSON.stringify(userData));

    } catch (error) {
      // Session není platná, odstraníme uložené údaje
      console.log('Session verification failed:', error);
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await authAPI.login(username, password);
      const userData = response.user;

      // Uložíme uživatele do stavu i localStorage
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));

    } catch (error) {
      throw error;
    }
  };

  const register = async (username: string, displayname: string, password: string) => {
    try {
      await authAPI.register(username, displayname, password);
      // Po registraci nepřihlašujeme uživatele automaticky
      // Uživatel se musí přihlásit manuálně
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      // I když logout selže na serveru, odstraníme lokální data
      console.error('Chyba při odhlašování:', error);
    } finally {
      // Vždy vyčistíme lokální stav
      setUser(null);
      localStorage.removeItem('user');
    }
  };

  const contextValue: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
