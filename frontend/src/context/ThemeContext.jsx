import React, { createContext, useContext, useState, useEffect } from 'react';

const defaultThemeContext = {
  theme: 'system',
  activeTheme: 'dark',
  isDark: true,
  setTheme: () => {},
  toggleTheme: () => {},
};

const ThemeContext = createContext(defaultThemeContext);

export const ThemeProvider = ({ children }) => {
  // Theme options: 'system' | 'dark' | 'light'
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem('mukt_kavya_theme') || 'system';
  });

  const [systemIsDark, setSystemIsDark] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true; // default dark
  });

  // Listen to device preference change
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setSystemIsDark(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Compute active theme ('dark' or 'light')
  const activeTheme = theme === 'system' ? (systemIsDark ? 'dark' : 'light') : theme;

  // Apply to document DOM
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', activeTheme);

    if (activeTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
  }, [activeTheme]);

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('mukt_kavya_theme', newTheme);
  };

  const toggleTheme = () => {
    const nextTheme = activeTheme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        activeTheme,
        isDark: activeTheme === 'dark',
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  return context || defaultThemeContext;
};
