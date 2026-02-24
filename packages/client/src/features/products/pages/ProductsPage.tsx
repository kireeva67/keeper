import { AppBar, Fab, Toolbar, Typography } from '@mui/material';
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from 'react-router-dom';
import { PRODUCTS_NEW_ROUTE } from '../../auth/config/authURLS';
import { ProductList } from '../list/ProductsList';
import { useProducts } from '../api/useProducts';

export default function ProductsPage() {
    const { products } = useProducts();
    const navigate = useNavigate();

    return (
        <>
            <AppBar position="fixed" color="default" elevation={1}>
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Products
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                        Number of products: {products.length}
                    </Typography>
                </Toolbar>
            </AppBar>

            <ProductList />

            <Fab
                color="primary"
                aria-label="add product"
                onClick={() => navigate(PRODUCTS_NEW_ROUTE)}
                sx={{
                    position: "fixed",
                    right: 24,
                    bottom: 24
                }}
            >
                <AddIcon />
            </Fab>
        </>
    );
}