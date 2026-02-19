import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Dialog, DialogTitle, DialogContent, CircularProgress, Box } from "@mui/material";
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
        <Dialog open onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle>Edit Product</DialogTitle>
            <DialogContent>
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