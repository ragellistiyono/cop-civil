import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/layouts.css';
import './styles/themes/hand-drawn.css';
import './styles/themes/neo-brutalism.css';
import './styles/themes/playful-geometric.css';
import './styles/themes/professional.css';
import './styles/themes/industrial.css';
import './styles/security.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
