import { Button } from "@mui/material";
import { CardsGrid } from "../cards/CardsGrid";
import { ProductCard } from "../cards/ProductCard";
import { useProducts } from "../api/useProducts";

export function ProductList() {
    const { products, hasMore, loading, loadMore } = useProducts();

    return (
        <>
            <CardsGrid>
                {products.map((p) => {
                    debugger
                    return <ProductCard key={p.id} product={p} />;
                })}

            </CardsGrid>

            {hasMore && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                    <Button onClick={loadMore} disabled={loading}>
                        {loading ? "Loading..." : "Load More"}
                    </Button>
                </div>
            )}
        </>
    );
}