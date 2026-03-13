import { Box, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { Category } from "../../../shared/types/CategoryType";
import { categoryChipSx } from "../../products/categories/categoryChipSx";

type Props = {
    cat: Category;
    onDelete?: () => void;
}

export default function CategoryTag({ cat, onDelete }: Props) {
    return (
        <Box
            sx={{
                display: 'inline-flex',
                alignItems: 'center',
                borderRadius: '16px',
                height: 32,
                pl: 1.5,
                pr: onDelete ? 0.75 : 1.5,
                fontSize: '0.8125rem',
                userSelect: 'none',
                ...categoryChipSx(cat.color),
            }}
        >
            {cat.name.toLowerCase()}
            {onDelete && (
                <IconButton size="small" onClick={onDelete} sx={{ p: 0.25, color: 'inherit' }}>
                    <CloseIcon sx={{ fontSize: 14 }} />
                </IconButton>
            )}
        </Box>
    );
}
