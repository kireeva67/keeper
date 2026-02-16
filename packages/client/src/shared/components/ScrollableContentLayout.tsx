import { Container } from "@mui/material";
import { Outlet } from "react-router-dom";

export function ScrollContentLayout() {
    return (
        <Container
            maxWidth="sm"
            disableGutters // Optional: removes default horizontal padding if you want edge-to-edge
            sx={{
                height: "100vh",
                overflowY: "auto",
                py: 2,
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                "&::-webkit-scrollbar": { display: "none" },
                pt: { xs: 7, sm: 12 },
                pb: 2,
            }}
        >
            <Outlet />
        </Container>
    );
}