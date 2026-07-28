import React, { createContext, useContext, useState, useEffect } from 'react';

export const themes = {
  sunset: {
    id: 'sunset',
    name: 'Carbon Coral Glass',
    description: 'Sleek dark carbon background with warm coral primary and teal accents.',
    bg: '#121214',
    sidebar: '#1a1a1e',
    card: '#1e1e22',
    border: 'rgba(255, 255, 255, 0.08)',
    primary: '#ff5722',
    primaryHover: '#f4511e',
    secondary: '#1e1e22',
    accent: '#14b8a6',
    heading: '#ffffff',
    body: '#e4e4eb',
    muted: '#9da4b0',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    badge: 'Carbon Sunset'
  },

  midnight: {
    id: 'midnight',
    name: 'Midnight Blue',
    description: 'Deep navy glassmorphism inspired by GitHub Dark & Raycast.',
    bg: '#0B1220',
    sidebar: '#111827',
    card: '#1E293B',
    border: '#334155',
    primary: '#3B82F6',
    primaryHover: '#2563EB',
    secondary: '#0F172A',
    accent: '#06B6D4',
    heading: '#F8FAFC',
    body: '#CBD5E1',
    muted: '#94A3B8',
    success: '#22C55E',
    warning: '#FBBF24',
    danger: '#EF4444',
    badge: 'Developer Favorite'
  },
  graphite: {
    id: 'graphite',
    name: 'Graphite Dark',
    description: 'Sleek dark matte theme inspired by Cursor AI & Obsidian.',
    bg: '#18181B',
    sidebar: '#27272A',
    card: '#3F3F46',
    border: '#52525B',
    primary: '#14B8A6',
    primaryHover: '#0D9488',
    secondary: '#18181B',
    accent: '#22D3EE',
    heading: '#FAFAFA',
    body: '#E4E4E7',
    muted: '#A1A1AA',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#F43F5E',
    badge: 'Pro Dark'
  },
  light: {
    id: 'light',
    name: 'Professional Light',
    description: 'Clean SaaS interface with high readability & soft contrast.',
    bg: '#F8FAFC',
    sidebar: '#FFFFFF',
    card: '#FFFFFF',
    border: '#E5E7EB',
    primary: '#2563EB',
    primaryHover: '#1D4ED8',
    secondary: '#0F172A',
    accent: '#10B981',
    heading: '#111827',
    body: '#374151',
    muted: '#6B7280',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
    badge: 'Clean Light'
  }
};

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('careerboost_theme') || 'sunset';
  });

  useEffect(() => {
    localStorage.setItem('careerboost_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);

    const t = themes[theme] || themes.sunset;
    const root = document.documentElement;
    root.style.setProperty('--bg-app', t.bg);
    root.style.setProperty('--bg-sidebar', t.sidebar);
    root.style.setProperty('--bg-card', t.card);
    root.style.setProperty('--border-color', t.border);
    root.style.setProperty('--primary', t.primary);
    root.style.setProperty('--accent', t.accent);
    root.style.setProperty('--text-heading', t.heading);
    root.style.setProperty('--text-body', t.body);
    root.style.setProperty('--text-muted', t.muted);

  }, [theme]);

  const changeTheme = (newThemeId) => {
    if (themes[newThemeId]) {
      setTheme(newThemeId);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, activeTheme: themes[theme] || themes.sunset, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
