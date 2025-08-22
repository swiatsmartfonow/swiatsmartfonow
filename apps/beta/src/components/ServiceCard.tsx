import React from 'react';
import { Card, CardContent, Typography, Box, Button } from '@mui/material';

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  isLarge?: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ 
  icon, 
  title, 
  description, 
  isLarge = false 
}) => {
  return (
    <Card 
      className={`h-full ${isLarge ? 'col-span-2' : ''}`}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <CardContent 
        className="flex flex-col items-center text-center p-6 flex-grow"
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          textAlign: 'center',
          flexGrow: 1
        }}
      >
        <Box
          sx={{
            backgroundColor: 'rgba(0, 122, 255, 0.1)',
            borderRadius: '50%',
            p: 2,
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {icon}
        </Box>
        
        <Typography
          variant={isLarge ? "h5" : "h6"}
          component="h3"
          sx={{
            fontWeight: isLarge ? 700 : 600,
            mb: description ? 2 : 3,
            flexGrow: 1
          }}
        >
          {title}
        </Typography>
        
        {description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 3, px: 2 }}
          >
            {description}
          </Typography>
        )}
        
        <Button
          variant="contained"
          fullWidth
          sx={{
            backgroundColor: '#f59e0b',
            '&:hover': {
              backgroundColor: '#d97706'
            },
            py: 1.5,
            fontWeight: 700
          }}
        >
          Dowiedz Się Więcej
        </Button>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
