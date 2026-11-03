import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Dialog, DialogTitle, DialogContent, CircularProgress, Box, useTheme, useMediaQuery } from "@mui/material";
import { ProductForm } from "./ProductForm";
import type { Product } from "../../../shared/types/ProductType";
import { getProduct } from "../api/getProduct";
import { useProducts } from "../api/useProducts";
import { useSnackbar } from "../../../shared/snackbar/useSnackbar";

export default function EditProductDialog() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [addingCategory, setAddingCategory] = useState(false);
    const { updateProductInState } = useProducts();
    const { showError } = useSnackbar();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const productTitle = "Edit Product";
    const actionsInTopBar = isMobile && !loading;
    const handleClose = () => navigate(-1);

    const handleSuccess = (updatedProduct?: Product) => {
        if (updatedProduct) {
            updateProductInState(updatedProduct);
        }
        handleClose();
    };

    useEffect(() => {
        if (id) {
            getProduct(parseInt(id))
                .then((data) => {
                    setProduct(data);
                    setLoading(false);
                })
                .catch(() => {
                    showError("Couldn't open this item. Please try again.");
                    handleClose();
                });
        }
    }, [id]);



    return (
        <Dialog open onClose={handleClose} fullWidth maxWidth="sm" fullScreen={isMobile}>
            {!actionsInTopBar && <DialogTitle sx={{ display: 'flex', justifyContent: 'center' }}>{addingCategory ? "New category" : productTitle}</DialogTitle>}
            <DialogContent sx={actionsInTopBar ? { pt: 0 } : undefined}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <ProductForm
                        initialData={product || undefined}
                        onCancel={handleClose}
                        onSuccess={handleSuccess}
                        onAddingCategoryChange={setAddingCategory}
                        topBarTitle={actionsInTopBar ? productTitle : undefined}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}