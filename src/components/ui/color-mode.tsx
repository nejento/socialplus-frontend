import React, { createContext, useContext, useEffect, useState } from 'react';

type ColorMode = 'light' | 'dark' | 'system';

interface ColorModeContextType {
  colorMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
  resolvedColorMode: 'light' | 'dark';
  toggleColorMode: () => void;
}

const ColorModeContext = createContext<ColorModeContextType | undefined>(undefined);

export const ColorModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize from localStorage if available, else system
  const [colorMode, setColorMode] = useState<ColorMode>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as ColorMode) || 'system';
  });

  const [resolvedColorMode, setResolvedColorMode] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    localStorage.setItem('theme', colorMode);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = (mode: 'light' | 'dark') => {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(mode);
      root.style.colorScheme = mode;
      root.setAttribute('data-theme', mode);
    };

    const handleSystemChange = () => {
      if (colorMode === 'system') {
        const mode = mediaQuery.matches ? 'dark' : 'light';
        setResolvedColorMode(mode);
        applyTheme(mode);
      }
    };

    if (colorMode === 'system') {
      handleSystemChange(); // Initial check
      mediaQuery.addEventListener('change', handleSystemChange);
    } else {
      setResolvedColorMode(colorMode);
      applyTheme(colorMode);
    }

    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [colorMode]);

  const toggleColorMode = () => {
    setColorMode((prev) => {
      if (prev === 'system') {
        return resolvedColorMode === 'light' ? 'dark' : 'light';
      }
      return prev === 'light' ? 'dark' : 'light';
    });
  };

  return (
    <ColorModeContext.Provider value={{ colorMode, setColorMode, resolvedColorMode, toggleColorMode }}>
      {children}
    </ColorModeContext.Provider>
  );
};

export const useColorMode = () => {
  const context = useContext(ColorModeContext);
  if (!context) throw new Error('useColorMode must be used within a ColorModeProvider');
  return context;
};
