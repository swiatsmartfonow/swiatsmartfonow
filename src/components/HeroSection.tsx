import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';

const HeroSection: React.FC = () => {
  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '60vh',
        backgroundImage: 'url("https://images.unsplash.com/photo-1661078483043-6a586b684f17?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHw0fHxzbWFydHBob25lJTIwcmVwYWlyJTIwdG9vbHMlMjB3b3Jrc2hvcHxlbnwwfDB8fHwxNzU1ODcwMTYxfDA&ixlib=rb-4.1.0&q=85")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1
        }
      }}
    >
      <Container 
        maxWidth="md" 
        sx={{ 
          position: 'relative', 
          zIndex: 2, 
          textAlign: 'center',
          py: 6
        }}
      >
        <Typography
          variant="h1"
          sx={{
            color: 'white',
            fontSize: { xs: '2.5rem', md: '3.5rem' },
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            mb: 3
          }}
        >
          Eksperckie usługi naprawy telefonów komórkowych
        </Typography>
        
        <Typography
          variant="body1"
          sx={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: { xs: '1rem', md: '1.125rem' },
            mb: 4,
            maxWidth: '600px',
            mx: 'auto'
          }}
        >
          Szybkie, niezawodne i niedrogie naprawy wszystkich głównych marek telefonów. 
          Przywróć swoje urządzenie do pełnej sprawności już dziś!
        </Typography>
        
        <Button
          variant="contained"
          color="secondary"
          size="large"
          sx={{
            px: 4,
            py: 2,
            fontSize: '1.1rem',
            fontWeight: 700
          }}
        >
          Zarezerwuj naprawę
        </Button>
      </Container>
    </Box>
  );
};

export default HeroSection;