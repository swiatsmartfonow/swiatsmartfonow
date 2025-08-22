import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Box,
  useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LayersIcon from '@mui/icons-material/Layers';

const Header: React.FC = () => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        color: theme.palette.text.primary
      }}
    >
      <Toolbar className="flex justify-between items-center px-4">
        <Box className="flex items-center gap-2">
          <LayersIcon 
            sx={{ 
              color: theme.palette.secondary.main,
              fontSize: '28px'
            }} 
          />
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              fontWeight: 900,
              fontSize: '1.25rem',
              color: theme.palette.text.primary
            }}
          >
            Świat Smartfonów
          </Typography>
        </Box>
        
        <IconButton
          edge="end"
          color="inherit"
          aria-label="menu"
          onClick={handleMenuOpen}
          sx={{ p: 2 }}
        >
          <MenuIcon sx={{ fontSize: '28px' }} />
        </IconButton>
        
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            sx: {
              mt: 1,
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
              minWidth: '200px'
            }
          }}
        >
          <MenuItem onClick={handleMenuClose} className="px-4 py-3">
            Usługi
          </MenuItem>
          <MenuItem onClick={handleMenuClose} className="px-4 py-3">
            O nas
          </MenuItem>
          <MenuItem onClick={handleMenuClose} className="px-4 py-3">
            Kontakt
          </MenuItem>
          <MenuItem onClick={handleMenuClose} className="px-4 py-3">
            Blog
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;