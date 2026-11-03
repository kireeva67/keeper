import { Box, Card, Skeleton } from "@mui/material";
import { CardsGrid } from "../cards/CardsGrid";

export function SkeletonCards({ count = 4 }: { count?: number }) {
    return (
        <Box role="status" aria-label="Loading your items">
            <CardsGrid>
                {Array.from({ length: count }, (_, i) => (
                    <Card key={i} aria-hidden sx={{ width: '100%', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
                        <Box sx={{ px: 2, pt: 2, pb: 1 }}>
                            <Skeleton variant="text" width="60%" sx={{ fontSize: '1rem' }} />
                        </Box>
                        <Skeleton variant="rectangular" sx={{ width: '100%', height: 'auto', aspectRatio: '16/9' }} />
                        <Box sx={{ px: 2, pt: 1, pb: 2 }}>
                            <Skeleton variant="rounded" width={64} height={24} sx={{ borderRadius: '20px' }} />
                        </Box>
                    </Card>
                ))}
            </CardsGrid>
        </Box>
    );
}
