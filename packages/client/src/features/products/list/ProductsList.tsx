import { Alert, Button, Typography } from "@mui/material";
import { CardsGrid } from "../cards/CardsGrid";
import { ProductCard } from "../cards/ProductCard";
import { useProducts } from "../api/useProducts";

export function ProductList() {
    const { products, hasMore, loading, loadMore, loadError, retry } = useProducts();

    if (loadError && products.length === 0) {
        return (
            <Alert severity="error" sx={{ mt: 2 }}
                action={<Button color="inherit" size="small" onClick={retry} disabled={loading}>Retry</Button>}
            >
                Couldn't load your items.
            </Alert>
        );
    }

    return (
        <>
            <CardsGrid>
                {products.map((p) => {
                    return <ProductCard key={p.id} product={p} />;
                })}

            </CardsGrid>

            {hasMore && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
                    {loadError && (
                        <Typography variant="body2" color="error" role="alert">
                            Couldn't load more items.
                        </Typography>
                    )}
                    <Button onClick={loadMore} disabled={loading}>
                        {loading ? "Loading..." : loadError ? "Try again" : "Load More"}
                    </Button>
                </div>
            )}
        </>
    );
}
