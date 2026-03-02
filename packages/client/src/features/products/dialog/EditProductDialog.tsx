import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Dialog, DialogTitle, DialogContent, CircularProgress, Box, useTheme, useMediaQuery } from "@mui/material";
import { ProductForm } from "./ProductForm";
import type { Product } from "../../../shared/types/ProductType";
import { getProduct } from "../api/getProduct";
import { useProducts } from "../api/useProducts";

export default function EditProductDialog() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const { updateProductInState } = useProducts();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
                .catch(() => handleClose());
        }
    }, [id]);



    return (
        <Dialog open onClose={handleClose} fullWidth maxWidth="sm" fullScreen={isMobile}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'center' }}>Edit Product</DialogTitle>
            <DialogContent sx={isMobile ? {
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
            } : undefined}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <ProductForm
                        initialData={product || undefined}
                        onCancel={handleClose}
                        onSuccess={handleSuccess}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}