import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Box } from '@mui/material';
import theme from './src/theme';
import Header from './src/components/Header';
import HeroSection from './src/components/HeroSection';
import ServicesSection from './src/components/ServicesSection';
import ContactForm from './src/components/ContactForm';
import Footer from './src/components/Footer';
import BottomNavigation from './src/components/BottomNavigation';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box 
        sx={{ 
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          pb: 10 // Add padding bottom for bottom navigation
        }}
      >
        <Header />
        
        <Box component="main" sx={{ flexGrow: 1 }}>
          <HeroSection />
          <ServicesSection />
          <ContactForm />
        </Box>
        
        <Footer />
        <BottomNavigation />
      </Box>
    </ThemeProvider>
  );
};

export default App;