import React, { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper
} from '@mui/material';

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle form submission here
  };

  return (
    <Box sx={{ backgroundColor: 'background.paper', py: 8 }}>
      <Container maxWidth="md">
        <Typography
          variant="h2"
          component="h2"
          sx={{
            textAlign: 'center',
            mb: 6,
            fontWeight: 700
          }}
        >
          Skontaktuj się z nami
        </Typography>
        
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 3,
            maxWidth: '600px',
            mx: 'auto'
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField
              fullWidth
              label="Twoje imię"
              name="name"
              value={formData.name}
              onChange={handleChange}
              variant="outlined"
              sx={{ mb: 3 }}
            />
            
            <TextField
              fullWidth
              label="Twój email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              variant="outlined"
              sx={{ mb: 3 }}
            />
            
            <TextField
              fullWidth
              label="Twój telefon"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              variant="outlined"
              sx={{ mb: 3 }}
            />
            
            <TextField
              fullWidth
              label="Twoja wiadomość"
              name="message"
              multiline
              rows={4}
              value={formData.message}
              onChange={handleChange}
              variant="outlined"
              sx={{ mb: 4 }}
            />
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              sx={{
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 700
              }}
            >
              Wyślij wiadomość
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default ContactForm;