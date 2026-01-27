import { Box, Container } from "@mui/material";
import { Outlet } from "react-router-dom";

export default function CenteredLayout() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 2, sm: 3 }, // responsive horizontal padding
        py: { xs: 3, sm: 6 }, // responsive vertical padding
      }}
    >
      <Container maxWidth="sm">
        <Outlet />
      </Container>
    </Box>
  );
}
