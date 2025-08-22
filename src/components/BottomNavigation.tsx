import React, { useState } from 'react';
import {
  BottomNavigation as MuiBottomNavigation,
  BottomNavigationAction,
  Paper,
  Box
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PhoneIcon from '@mui/icons-material/Phone';

const BottomNavigation: React.FC = () => {
  const [value, setValue] = useState(1); // Services tab is active by default

  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0,
        zIndex: 1000,
        borderTop: '1px solid',
        borderColor: 'divider'
      }} 
      elevation={3}
    >
      <MuiBottomNavigation
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
        }}
        sx={{ height: 80 }}
      >
        <BottomNavigationAction
          label="Główna"
          icon={<HomeIcon />}
          sx={{
            color: 'text.secondary',
            '&.Mui-selected': {
              color: 'primary.main'
            }
          }}
        />
        <BottomNavigationAction
          label="Usługi"
          icon={
            <Box
              sx={{
                backgroundColor: '#f59e0b',
                borderRadius: '50%',
                p: 1.5,
                transform: 'translateY(-16px)',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
              }}
            >
              <CheckCircleIcon sx={{ color: 'white', fontSize: 28 }} />
            </Box>
          }
          sx={{
            color: 'primary.main',
            fontWeight: 700,
            '& .MuiBottomNavigationAction-label': {
              transform: 'translateY(-12px)',
              fontWeight: 700
            }
          }}
        />
        <BottomNavigationAction
          label="Kontakt"
          icon={<PhoneIcon />}
          sx={{
            color: 'text.secondary',
            '&.Mui-selected': {
              color: 'primary.main'
            }
          }}
        />
      </MuiBottomNavigation>
    </Paper>
  );
};

export default BottomNavigation;