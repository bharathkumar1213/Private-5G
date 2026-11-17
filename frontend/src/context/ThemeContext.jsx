import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Default to 'light' (Looker Executive Summary) to match the reference dashboard
  const [theme, setTheme] = useState(() => {
    // If user hasn't explicitly set looker theme version, default to light
    const saved = localStorage.getItem('5g_dashboard_theme');
    if (!saved || saved === 'dark') {
      // Set to light for initial Looker Executive experience
      localStorage.setItem('5g_dashboard_theme', 'light');
      return 'light';
    }
    return saved || 'light';
  });

  useEffect(() => {
    localStorage.setItem('5g_dashboard_theme', theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

