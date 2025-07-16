import 'tailwindcss/tailwind.css';
import '@fontsource/orbitron/400.css';
import '@fontsource/orbitron/700.css';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/700.css';
import { Toaster } from 'sonner';
 
// ... existing code ... 

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Toaster position="top-center" richColors theme="dark" />
    </>
  );
} 