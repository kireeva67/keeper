import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/App.tsx'
import { theme } from './app/providers/theme.tsx'
import { ThemeProvider, CssBaseline } from "@mui/material";
console.log('Theme:', theme);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>

  </StrictMode>,
)
