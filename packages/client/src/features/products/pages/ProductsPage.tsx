import { AppBar, Fab, Toolbar, Typography } from '@mui/material';
import { getProducts } from '../api/getPoducts';
import { useEffect, useState } from 'react';
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from 'react-router-dom';
import { PRODUCTS_NEW_ROUTE } from '../../auth/config/authURLS';
import { CardsGrid } from '../cards/CardsGrid';
import type { Product } from '../../../shared/types/ProductType';
import { ProductCard } from '../cards/ProductCard';
import { DEFAULT_PRODUCT_IMAGE } from '../cards/DefaultImage';

export default function ProductsPage() {
    const [count, setCount] = useState<number>(0);
    const [products, setProducts] = useState<Product[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        getProducts()
            .then(products => {
                setCount(products.length);
                setProducts(products);
            })
            .catch(() => { });
    }, []);

    return (
        <>
            <AppBar position="fixed" color="default" elevation={1}>
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Products
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                        Number of products: {count}
                    </Typography>
                </Toolbar>
            </AppBar>

            <CardsGrid>
                {products.map((p, i) => (
                    <ProductCard key={i} title={p.title} imageUrl={DEFAULT_PRODUCT_IMAGE} goTo={p.url} description={p.description ?? ''} />
                ))}
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