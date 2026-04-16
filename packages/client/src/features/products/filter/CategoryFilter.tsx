
import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";
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
    borderRadius: '16px !important',
    textTransform: 'none',
    height: 32,
    px: 1.5,
    fontSize: '0.8125rem',
    minWidth: 'unset',
    whiteSpace: 'nowrap',
    bgcolor: 'action.hover',
    color: 'text.disabled',
    border: '1px solid transparent !important',
};

export default function CategoryFilter({ categories, value, onChange, count }: CategoryFilterProps) {
    const isAll = value.length === 0;
    const catCount = (cat: Category) => cat._count?.products ?? 0;
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
                        border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.3)} !important`,
                        fontWeight: 600,
                    },
                }}
            >
                all{count > 0 ? ` · ${count}` : ''}
            </ToggleButton>
            <Box sx={{ display: 'flex', overflowX: 'auto', flexWrap: 'nowrap', gap: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
                <ToggleButtonGroup
                    value={value}
                    onChange={(_, newIds) => {
                        onChange(newIds ?? null)
                    }}
                    sx={{ flexWrap: 'nowrap', gap: 1 }}
                >
                    {categories.map(cat => {
                        return (
                            <ToggleButton key={cat.id} value={cat.id} size="small"
                                sx={{
                                    ...pillSx,

                                    '&.Mui-selected': {
                                        ...categoryChipSx(cat.color),
                                        border: `1px solid ${cat.color} !important`,
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
                </ToggleButtonGroup>
            </Box>
        </Box>
    );
}
