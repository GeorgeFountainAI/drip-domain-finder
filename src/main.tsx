import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Log example affiliate URL for verification
if (import.meta.env.DEV) {
  import('./utils/spaceship').then(({ buildSpaceshipUrl }) => {
    console.log('Example BUY URL:', buildSpaceshipUrl('mytest123.com'));
  });
}

createRoot(document.getElementById("root")!).render(
  <App />
);