import { createTheme } from "@mui/material";

export const theme = createTheme({
    palette: {
        primary: {
            main: '#5e2d91',
            light: '#9c6bc4',
            dark: '#3b1a5e',
            contrastText: '#fff',
        },
        background: {
            default: '#f5f5f5',
            paper: '#ffffff',
        },
    },
    shape: {
        borderRadius: 12,
    },
    typography: {
        fontFamily: '"DM Sans", "Helvetica Neue", sans-serif',
        fontWeightMedium: 500,
    },
    components: {
        MuiDialogTitle: {
            styleOverrides: {
                root: {
                    fontWeight: 600,
                },
            },
        },
        MuiButton: {
            defaultProps: {
                disableElevation: true,
            },
            styleOverrides: {
                root: {
                    textTransform: "none",
                    borderRadius: 10,
                },
            },
        },
    },
});
