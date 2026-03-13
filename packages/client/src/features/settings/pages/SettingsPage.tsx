import { Box, IconButton, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PRODUCTS_ROUTE } from "../../auth/config/authURLS";
import { ProfileSection } from "../components/ProfileSection";
import { useCategories } from "../../products/api/useCategories";
import CategoryTag from "../components/CategoryTag";
import ConfirmDeletionDialog from "../components/ConfirmDeletionDialog";
import { useProducts } from "../../products/api/useProducts";

export default function SettingsPage() {
    const navigate = useNavigate();
    const { reassignCategoryInState } = useProducts();
    const { customCategories, deleteCategory, otherCategory } = useCategories();
    const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
    const pendingCategory = customCategories.find(c => c.id === pendingDeleteId);

    const handleDelete = async () => {
        if (pendingDeleteId) {
            await deleteCategory(pendingDeleteId);
            reassignCategoryInState(pendingDeleteId, otherCategory()!);
            setPendingDeleteId(null);
        }
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <IconButton onClick={() => navigate(PRODUCTS_ROUTE)} edge="start">
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h6">Settings</Typography>
            </Box>
            <ProfileSection />
            {customCategories.length > 0 && (
                <Box>
                    <Typography variant="overline" color="text.secondary">My categories</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                        {customCategories.map(cat => (
                            <CategoryTag key={cat.id} cat={cat} onDelete={() => setPendingDeleteId(cat.id)} />
                        ))}
                    </Box>
                </Box>
            )}

            <ConfirmDeletionDialog
                open={Boolean(pendingCategory)}
                categoryName={pendingCategory?.name ?? ""}
                onConfirm={handleDelete}
                onCancel={() => setPendingDeleteId(null)}
            />
        </Box>
    );
}
