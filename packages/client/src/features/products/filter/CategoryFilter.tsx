import { Box, ToggleButton } from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { Category } from "../../../shared/types/CategoryType";
import { categoryChipSx } from "../categories/categoryChipSx";

type CategoryFilterProps = {
    categories: Category[];
    value: number[];
    onChange: (ids: number[]) => void;
    count: number;
}

const pillSx = {
    borderRadius: '16px',
    textTransform: 'none',
    height: 32,
    px: 1.5,
    fontSize: '0.8125rem',
    minWidth: 'unset',
    whiteSpace: 'nowrap',
    bgcolor: 'action.hover',
    color: 'text.secondary',
    border: '1px solid transparent',
};

export default function CategoryFilter({ categories, value, onChange, count }: CategoryFilterProps) {
    const isAll = value.length === 0;
    const catCount = (cat: Category) => cat._count?.products ?? 0;
    const toggle = (id: number) => onChange(value.includes(id) ? value.filter(selectedId => selectedId !== id) : [...value, id]);
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, maxWidth: 1200, width: '100%', overflow: 'hidden' }}>
            <ToggleButton
                value="all"
                selected={isAll}
                onChange={() => onChange([])}
                size="small"
                sx={{
                    ...pillSx,
                    flexShrink: 0,
                    '&:hover': {
                        bgcolor: 'action.hover',
                    },
                    '&.Mui-selected, &.Mui-selected:hover': {
                        bgcolor: (t) => alpha(t.palette.primary.main, 0.3),
                        color: 'primary.main',
                        border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.8)}`,
                        fontWeight: 600,
                    },
                }}
            >
                all{count > 0 ? ` · ${count}` : ''}
            </ToggleButton>
            <Box sx={{ display: 'flex', overflowX: 'auto', flexWrap: 'nowrap', gap: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
                <Box role="group" aria-label="Filter by category" sx={{ display: 'flex', flexWrap: 'nowrap', gap: 1 }}>
                    {categories.map(cat => {
                        return (
                            <ToggleButton key={cat.id} value={cat.id} size="small"
                                selected={value.includes(cat.id)}
                                onChange={() => toggle(cat.id)}
                                sx={{
                                    ...pillSx,

                                    '&.Mui-selected': {
                                        ...categoryChipSx(cat.color),
                                        '&:hover': {
                                            ...categoryChipSx(cat.color),
                                            opacity: 0.8,
                                        },
                                    },
                                    '&:hover': {
                                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                    }
                                }}
                            >
                                {cat.name.toLowerCase()}{catCount(cat) > 0 ? ` · ${catCount(cat)}` : ''}
                            </ToggleButton>
                        )
                    })}
                </Box>
            </Box>
        </Box>
    );
}
