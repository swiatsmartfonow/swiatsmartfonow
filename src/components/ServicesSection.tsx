import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import ServiceCard from './ServiceCard';
import PhoneIphoneOutlinedIcon from '@mui/icons-material/PhoneIphoneOutlined';
import BatteryChargingFullOutlinedIcon from '@mui/icons-material/BatteryChargingFullOutlined';
import WifiIcon from '@mui/icons-material/Wifi';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import BuildIcon from '@mui/icons-material/Build';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import BugReportIcon from '@mui/icons-material/BugReport';

const ServicesSection: React.FC = () => {
  const services = [
    {
      icon: <PhoneIphoneOutlinedIcon sx={{ fontSize: 32, color: '#007AFF' }} />,
      title: 'Naprawa ekranu'
    },
    {
      icon: <BatteryChargingFullOutlinedIcon sx={{ fontSize: 32, color: '#007AFF' }} />,
      title: 'Wymiana baterii'
    },
    {
      icon: <WifiIcon sx={{ fontSize: 32, color: '#007AFF' }} />,
      title: 'Problemy z łącznością'
    },
    {
      icon: <CameraAltIcon sx={{ fontSize: 32, color: '#007AFF' }} />,
      title: 'Naprawa aparatu'
    },
    {
      icon: <VolumeUpIcon sx={{ fontSize: 32, color: '#007AFF' }} />,
      title: 'Naprawa głośnika'
    },
    {
      icon: <WaterDropIcon sx={{ fontSize: 32, color: '#007AFF' }} />,
      title: 'Zalanie wodą'
    },
    {
      icon: <RadioButtonCheckedIcon sx={{ fontSize: 32, color: '#f59e0b' }} />,
      title: 'Naprawa Przycisków'
    },
    {
      icon: <BugReportIcon sx={{ fontSize: 32, color: '#f59e0b' }} />,
      title: 'Diagnostyka'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography
        variant="h2"
        component="h2"
        sx={{
          textAlign: 'center',
          mb: 6,
          fontWeight: 700
        }}
      >
        Nasze Usługi
      </Typography>
      
      <Box className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {services.map((service, index) => (
          <ServiceCard
            key={index}
            icon={service.icon}
            title={service.title}
          />
        ))}
      </Box>

      {/* Express Service Card */}
      <Box className="grid grid-cols-1 gap-4">
        <ServiceCard
          icon={<BuildIcon sx={{ fontSize: 40, color: '#f59e0b' }} />}
          title="Serwis Ekspres"
          description="Napraw swój telefon w mniej niż godzinę!"
          isLarge={true}
        />
      </Box>
    </Container>
  );
};

export default ServicesSection;