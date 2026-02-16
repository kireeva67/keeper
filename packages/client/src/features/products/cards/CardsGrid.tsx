import { Box } from "@mui/material";

export function CardsGrid({ children }: { children: React.ReactNode }) {
    return (
        <Box
            sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: {
                    xs: "repeat(1, 1fr)",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(2, 1fr)",
                    lg: "repeat(2, 1fr)",
                },
            }}
        >
            {children}
        </Box>
    );
}