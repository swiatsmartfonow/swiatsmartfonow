import React from 'react';
import { Box, Typography, IconButton, Container } from '@mui/material';
import TwitterIcon from '@mui/icons-material/Twitter';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'primary.main',
        color: 'rgba(255, 255, 255, 0.8)',
        py: 6,
        textAlign: 'center'
      }}
    >
      <Container maxWidth="lg">
        <Box className="flex justify-center gap-4 mb-6">
          <IconButton
            sx={{ 
              color: 'rgba(255, 255, 255, 0.8)',
              '&:hover': { color: 'white' }
            }}
          >
            <TwitterIcon />
          </IconButton>
          <IconButton
            sx={{ 
              color: 'rgba(255, 255, 255, 0.8)',
              '&:hover': { color: 'white' }
            }}
          >
            <FacebookIcon />
          </IconButton>
          <IconButton
            sx={{ 
              color: 'rgba(255, 255, 255, 0.8)',
              '&:hover': { color: 'white' }
            }}
          >
            <InstagramIcon />
          </IconButton>
        </Box>
        
        <Typography variant="body1">
          © 2024 Świat Smartfonów. Wszelkie prawa zastrzeżone.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
