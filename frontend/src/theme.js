import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { 
      main: "#1a365d",     // Deep navy blue
      light: "#2d5a87",    
      dark: "#0f2332",
      contrastText: "#ffffff"
    },
    secondary: { 
      main: "#2563eb",     // Professional blue
      light: "#60a5fa",
      dark: "#1e40af"
    },
    background: { 
      default: "#f8fafc",  // Clean white-gray
      paper: "#ffffff"
    },
    text: { 
      primary: "#1e293b",  // Dark slate
      secondary: "#64748b" 
    },
    success: { main: "#059669" },
    warning: { main: "#d97706" },
    error: { main: "#dc2626" },
    info: { main: "#0369a1" },
    grey: {
      50: "#f8fafc",
      100: "#f1f5f9", 
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: "#64748b",
      600: "#475569",
      700: "#334155",
      800: "#1e293b",
      900: "#0f172a"
    }
  },
  typography: {
    fontFamily: ["Inter", "system-ui", "-apple-system", "sans-serif"].join(","),
    h1: { fontWeight: 800, fontSize: "3rem", letterSpacing: "-0.025em", lineHeight: 1.1 },
    h2: { fontWeight: 700, fontSize: "2.25rem", letterSpacing: "-0.025em", lineHeight: 1.2 },
    h3: { fontWeight: 700, fontSize: "1.875rem", letterSpacing: "-0.02em", lineHeight: 1.3 },
    h4: { fontWeight: 600, fontSize: "1.5rem", letterSpacing: "-0.02em", lineHeight: 1.4 },
    h5: { fontWeight: 600, fontSize: "1.25rem", lineHeight: 1.5 },
    h6: { fontWeight: 600, fontSize: "1.125rem", lineHeight: 1.5 },
    body1: { fontSize: "1rem", lineHeight: 1.6 },
    body2: { fontSize: "0.875rem", lineHeight: 1.6 },
    button: { 
      textTransform: "none", 
      fontWeight: 600,
      letterSpacing: "0.025em"
    }
  },
  shape: { borderRadius: 8 },
  shadows: [
    "none",
    "0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)",
    "0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)",
    "0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23)",
    "0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22)",
    "0 19px 38px rgba(0, 0, 0, 0.30), 0 15px 12px rgba(0, 0, 0, 0.22)"
  ],
  components: {
    MuiCard: { 
      styleOverrides: { 
        root: { 
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
          border: "1px solid #e2e8f0",
          "&:hover": {
            boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1)",
          }
        } 
      } 
    },
    MuiButton: { 
      styleOverrides: { 
        root: { 
          borderRadius: 8,
          padding: "10px 20px",
          fontSize: "0.875rem",
          fontWeight: 600,
          textTransform: "none",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.12)",
            transform: "translateY(-1px)"
          }
        },
        contained: {
          color: "white"
        }
      } 
    },
    MuiAppBar: { 
      styleOverrides: { 
        root: { 
          backgroundColor: "#ffffff",
          color: "#1e293b",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          borderBottom: "1px solid #e2e8f0"
        } 
      } 
    },
    MuiTextField: { 
      styleOverrides: { 
        root: { 
          "& .MuiOutlinedInput-root": { 
            borderRadius: 8,
            backgroundColor: "#ffffff",
            "&:hover fieldset": {
              borderColor: "#64748b"
            }
          } 
        } 
      } 
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500
        }
      }
    }
  }
});

export default theme;
