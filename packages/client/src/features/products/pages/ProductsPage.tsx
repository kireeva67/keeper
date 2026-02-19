import { AppBar, Fab, Toolbar, Typography } from '@mui/material';
import { useEffect } from 'react';
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from 'react-router-dom';
import { PRODUCTS_NEW_ROUTE } from '../../auth/config/authURLS';
import { CardsGrid } from '../cards/CardsGrid';
import { ProductCard } from '../cards/ProductCard';
import { useProducts } from '../api/useProducts';

export default function ProductsPage() {
    const { products, refresh } = useProducts();
    const navigate = useNavigate();

    useEffect(() => {
        refresh();
    }, [refresh]);

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

            <CardsGrid>
                {products.map((p) => (<ProductCard key={p.id} product={p} />))}
            </CardsGrid>

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