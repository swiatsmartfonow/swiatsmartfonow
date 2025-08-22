import React from 'react'
import { ThemeProvider, CssBaseline, Box } from '@mui/material'
import theme from './theme'
import Header from './components/Header'
import HeroSection from './components/HeroSection'
import ServicesSection from './components/ServicesSection'
import ContactForm from './components/ContactForm'
import Footer from './components/Footer'
import BottomNavigation from './components/BottomNavigation'

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          pb: 10
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
  )
}

export default App
