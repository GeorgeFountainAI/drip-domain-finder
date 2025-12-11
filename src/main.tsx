import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Log example affiliate URL for verification
if (import.meta.env.DEV) {
  const exampleDomain = 'mytest123.com';
  const exampleUrl = `https://namecheap.pxf.io/gOzBbX/search?domain=${encodeURIComponent(exampleDomain)}`;
  console.log('Example BUY URL:', exampleUrl);
}

createRoot(document.getElementById("root")!).render(
  <App />
);