import { Alert, Button, Typography } from "@mui/material";
import { CardsGrid } from "../cards/CardsGrid";
import { ProductCard } from "../cards/ProductCard";
import { useProducts } from "../api/useProducts";
import { SkeletonCards } from "./SkeletonCards";
import { EmptyState } from "./EmptyState";

export function ProductList() {
    const { products, hasMore, loading, loadMore, loadError, retry, categories, categoriesIds } = useProducts();

    if (loadError && products.length === 0) {
        return (
            <Alert severity="error" sx={{ mt: 2 }}
                action={<Button color="inherit" size="small" onClick={retry} disabled={loading}>Retry</Button>}
            >
                Couldn't load your items.
            </Alert>
        );
    }

    const isEmpty = products.length === 0;
    const allPagesLoaded = !hasMore;

    if (isEmpty && loading) return <SkeletonCards />;

    if (isEmpty && allPagesLoaded) {
        const selectedNames = categories.filter(c => categoriesIds.includes(c.id)).map(c => c.name);
        const allSelectedNamesKnown = selectedNames.length === categoriesIds.length;
        return (
            <EmptyState
                filtered={categoriesIds.length > 0}
                filterNames={allSelectedNamesKnown ? selectedNames : []}
            />
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
