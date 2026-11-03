import { Box, Typography } from "@mui/material";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";

type EmptyStateProps = {
    filtered: boolean;
    filterNames: string[];
};

export function EmptyState({ filtered, filterNames }: EmptyStateProps) {
    const oneNamedCategory = filterNames.length === 1;
    const title = !filtered
        ? "Nothing saved yet"
        : oneNamedCategory
            ? `Nothing in ${filterNames[0].toLowerCase()} yet`
            : "Nothing in these categories yet";
    const hint = !filtered
        ? "Tap + to save your first link."
        : oneNamedCategory
            ? "Items you save in this category will show up here."
            : "Items you save in these categories will show up here.";

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 1, px: 2, py: 6 }}>
            <BookmarkBorderIcon sx={{ fontSize: 48, color: 'primary.light' }} aria-hidden />
            <Typography variant="h6" component="p" fontWeight={600}>{title}</Typography>
            <Typography variant="body2" color="text.secondary">{hint}</Typography>
        </Box>
    );
}
