import { createTheme } from "@mui/material";

export const theme = createTheme({
    components: {
        MuiButton: {
            defaultProps: {
                disableElevation: true,
            },
            styleOverrides: {
                root: {
                    textTransform: "none",
                    borderRadius: 10,
                    "& input": {
                        color: "#9e9e9e",
                    },
                },
            },
        },
    },
    typography: {
        fontFamily: `"Inter", "Roboto", "Helvetica", "Arial", sans-serif`,
    },
    palette: {
        primary: {
            main: "#643380ff",
        },
    },
});
