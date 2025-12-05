import { createTheme } from '@mui/material/styles';

// Định nghĩa màu sắc, font chữ, và các tùy chỉnh khác
const theme = createTheme({
  palette: {
    mode: 'light', // hoặc 'dark'
    primary: {
      main: '#1976d2', // Màu chủ đạo
    },
    secondary: {
      main: '#dc004e', // Màu phụ
    },
    background: {
      default: '#f4f6f8',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    }
  },
  components: {
    // Tùy chỉnh mặc định cho các component
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
      },
    },
    MuiCard: {
        styleOverrides: {
            root: {
                borderRadius: 12,
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
            }
        }
    }
  },
});

export default theme;