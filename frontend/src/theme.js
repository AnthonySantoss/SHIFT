const theme = (isDarkMode) => ({
  colors: {
    primary: '#F59E0B', // SHIFT Yellow
    secondary: '#0F172A', // Slate Escuro (Contraste Premium)
    onPrimary: '#000000', // Texto preto sobre Amarelo
    onSecondary: '#FFFFFF', // Texto branco sobre Slate
    success: '#10B981',
    danger: '#EF4444',
    warning: '#F97316',
    info: '#3B82F6',
    bg: isDarkMode ? '#0F1015' : '#F8FAFC',
    card: isDarkMode ? '#171923' : '#FFFFFF',
    border: isDarkMode ? '#222530' : '#E2E8F0',
    title: isDarkMode ? '#FFFFFF' : '#0F172A',
    text: isDarkMode ? '#94A3B8' : '#475569',
    muted: isDarkMode ? '#475569' : '#94A3B8',
    input: isDarkMode ? '#0B0C10' : '#F8FAFC',
    white: '#FFFFFF',
    black: '#000000',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
  roundness: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 99,
  },
  shadows: {
    soft: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.1,
      shadowRadius: 15,
      elevation: 4,
    },
    hard: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.2,
      shadowRadius: 20,
      elevation: 8,
    }
  }
});

export default theme;
