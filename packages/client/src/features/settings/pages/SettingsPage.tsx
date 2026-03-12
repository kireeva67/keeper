import { Box, IconButton, List, ListItem, ListItemText, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { PRODUCTS_ROUTE } from "../../auth/config/authURLS";
import { ProfileSection } from "../components/ProfileSection";

const placeholderCategories = [
    { id: 1, name: "Electronics", color: "#1976d2" },
    { id: 2, name: "Study", color: "#7b1fa2" },
    { id: 3, name: "Electronics", color: "#1976d2" },
    { id: 4, name: "Study", color: "#7b1fa2" },
    { id: 5, name: "Electronics", color: "#1976d2" },
    { id: 6, name: "Study", color: "#7b1fa2" },
    { id: 7, name: "Electronics", color: "#1976d2" },
    { id: 8, name: "Study", color: "#7b1fa2" },
];

export default function SettingsPage() {
    const navigate = useNavigate();

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <IconButton onClick={() => navigate(PRODUCTS_ROUTE)} edge="start">
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h6">Settings</Typography>
            </Box>

            <ProfileSection />

            {/* My categories */}
            <Box>
                <Typography variant="overline" color="text.secondary">My categories</Typography>
                <Box sx={{ maxHeight: 240, overflowY: "auto", overflowX: "hidden" }}>
                    <List disablePadding>
                        {placeholderCategories.map(cat => (
                            <ListItem
                                key={cat.id}
                                disableGutters
                                secondaryAction={
                                    <IconButton edge="end" size="small">
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                }
                            >
                                <Box
                                    sx={{
                                        width: 12,
                                        height: 12,
                                        borderRadius: "50%",
                                        bgcolor: cat.color,
                                        mr: 1.5,
                                        flexShrink: 0,
                                    }}
                                />
                                <ListItemText primary={cat.name} />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Box>
        </Box>
    );
}
