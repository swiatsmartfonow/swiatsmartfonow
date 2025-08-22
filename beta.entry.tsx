import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './beta';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
} else {
  console.error('Root container #root not found');
}
