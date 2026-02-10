// In your ProductsPage.tsx
import { Box, Container, Fab } from '@mui/material';
import { getProducts } from '../api/getPoducts';
import { useEffect, useState } from 'react';
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from 'react-router-dom';
import { PRODUCTS_NEW_ROUTE } from '../../auth/config/authURLS';

export default function ProductsPage() {
    const [count, setCount] = useState<number>(0);
    const navigate = useNavigate();

    useEffect(() => {
        getProducts().then(products => setCount(products.length))
    }, []);

    return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <h1>Products Page</h1>
            <p>Welcome! Your session is valid.</p>
            <p>Number of products: {count}</p>

            <Box sx={{ position: "fixed", right: 24, bottom: 24 }}>
                <Fab
                    color="primary"
                    aria-label="add product"
                    onClick={() => navigate(PRODUCTS_NEW_ROUTE)}
                >
                    <AddIcon />
                </Fab>
            </Box>
        </Container>
    );
}