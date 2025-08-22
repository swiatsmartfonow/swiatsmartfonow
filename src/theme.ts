import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#141414',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#007AFF',
      contrastText: '#ffffff'
    },
    background: {
      default: '#F9F9F9',
      paper: '#ffffff'
    },
    text: {
      primary: '#1C1C1E',
      secondary: '#636366'
    },
    grey: {
      100: '#E5E5EA',
      200: '#D1D1D6',
      300: '#C7C7CC',
      400: '#AEAEB2',
      500: '#8E8E93',
      600: '#636366',
      700: '#48484A',
      800: '#3A3A3C',
      900: '#1C1C1E'
    }
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 800,
      lineHeight: 1.2,
      letterSpacing: '-0.015em'
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: '-0.015em'
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5
    },
    button: {
      fontWeight: 700,
      textTransform: 'none'
    }
  },
  shape: {
    borderRadius: 12
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '24px',
          padding: '12px 32px',
          fontSize: '1rem',
          fontWeight: 700,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
          }
        }
      }
    }
  }
});

export default theme;