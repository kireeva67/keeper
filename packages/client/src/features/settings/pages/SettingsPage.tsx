import { Box, Button, Divider, IconButton, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonRemove from "@mui/icons-material/PersonRemove";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LOGIN_ROUTE, PRODUCTS_ROUTE } from "../../auth/config/authURLS";
import { ProfileSection } from "../components/ProfileSection";
import { useCategories } from "../../products/api/useCategories";
import CategoryTag from "../components/CategoryTag";
import ConfirmDeletionDialog from "../components/ConfirmDeletionDialog";
import { useProducts } from "../../products/api/useProducts";
import { deleteUser } from "../../../shared/api/deleteUser";
import { useAuth } from "../../auth/api/useAuth";

export default function SettingsPage() {
    const navigate = useNavigate();
    const { reassignCategoryInState } = useProducts();
    const { customCategories, deleteCategory, otherCategory } = useCategories();
    const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
    const pendingCategory = customCategories.find(c => c.id === pendingDeleteId);
    const [pendingAccount, setPendingAccount] = useState(false);
    const { setAuthenticated } = useAuth();

    const handleDelete = async () => {
        if (pendingDeleteId) {
            await deleteCategory(pendingDeleteId);
            reassignCategoryInState(pendingDeleteId, otherCategory()!);
            setPendingDeleteId(null);
        }
    };

    const handleAccountDeletion = async () => {
        if (pendingAccount) {
            const result = await deleteUser();
            if (result) {
                setAuthenticated(false);
                navigate(LOGIN_ROUTE);
            }
        }
    }

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

            <Divider />
            <Button onClick={() => setPendingAccount(true)} variant="outlined" color="error" startIcon={<PersonRemove />}>
                Delete account
            </Button>

            <ConfirmDeletionDialog
                open={Boolean(pendingCategory)}
                title={`Delete category "${pendingCategory?.name}"?`}
                description="Any products in this category will be reassigned to Other."
                onConfirm={handleDelete}
                onCancel={() => setPendingDeleteId(null)}
            />

            <ConfirmDeletionDialog
                open={Boolean(pendingAccount)}
                title="Delete account?"
                description="Deleting your account will remove all your data. This action cannot be undone."
                onConfirm={handleAccountDeletion}
                onCancel={() => setPendingAccount(false)}
            />
        </Box>
    );
}
