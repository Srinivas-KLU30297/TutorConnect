import React from "react";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, CssBaseline, Container, Box } from "@mui/material";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes";
import NavBar from "./components/common/NavBar";
import AnimatedBackground from "./components/ui/AnimatedBackground";
import theme from "./theme";
import "./index.css";

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AnimatedBackground />
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <BrowserRouter>
            <NavBar />
            <Box sx={{ flexGrow: 1 }}>
              <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
                <AppRoutes />
              </Container>
            </Box>
          </BrowserRouter>
        </Box>
      </ThemeProvider>
    </AuthProvider>
  );
}
