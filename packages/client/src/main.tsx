import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/App.tsx'
import { theme } from './app/providers/theme.tsx'
import { ThemeProvider, CssBaseline, GlobalStyles } from "@mui/material";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles styles={{ 'html, body, #root': { height: '100%', margin: 0, overflow: 'hidden' } }} />
      <App />
    </ThemeProvider>

  </StrictMode>,
)
