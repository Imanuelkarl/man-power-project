// contexts/ThemeContext.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);

  // Check system preference
  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    return 'dark';
  };

  // Apply theme to HTML element
  const applyTheme = (newTheme: 'light' | 'dark') => {
    const html = document.documentElement;
    html.classList.remove('light', 'dark');
    if (newTheme === 'light') {
      html.classList.add('light');
    } else {
      html.classList.add('dark');
    }
    setResolvedTheme(newTheme);
  };

  // Handle theme changes
  useEffect(() => {
    if (!mounted) return;

    let resolved: 'light' | 'dark';
    if (theme === 'system') {
      resolved = getSystemTheme();
    } else {
      resolved = theme as 'light' | 'dark';
    }
    applyTheme(resolved);
  }, [theme, mounted]);

  // Listen to system theme changes
  useEffect(() => {
    if (!mounted) return;
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    const handleChange = (e: MediaQueryListEvent) => {
      applyTheme(e.matches ? 'light' : 'dark');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, mounted]);

  useEffect(() => {
    setMounted(true);
    // Initial theme application
    const initialTheme = localStorage.getItem('theme') as Theme || 'system';
    setTheme(initialTheme);
    
    let resolved: 'light' | 'dark';
    if (initialTheme === 'system') {
      resolved = getSystemTheme();
    } else {
      resolved = initialTheme as 'light' | 'dark';
    }
    applyTheme(resolved);
  }, []);

  // Persist theme preference
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('theme', theme);
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme(current => {
      if (current === 'light') return 'dark';
      if (current === 'dark') return 'system';
      return 'light';
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}