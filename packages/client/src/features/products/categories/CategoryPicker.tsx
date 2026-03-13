import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import type { Category } from "../../../shared/types/CategoryType";
import { categoryChipSx } from "./categoryChipSx";

type Props = {
    categories: Category[];
    value: number;
    onChange: (id: number) => void;
    onAdd?: () => void;
}

export default function CategoryPicker({ categories, value, onChange, onAdd }: Props) {
    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2, alignItems: 'center' }}>
            <ToggleButtonGroup
                value={value}
                exclusive
                onChange={(_, newId) => { if (newId) onChange(newId) }}
                sx={{ flexWrap: 'wrap', gap: 1 }}
            >
                {categories.map(cat => (
                    <ToggleButton key={cat.id} value={cat.id} size="small"
                        sx={{
                            borderRadius: '16px !important',
                            textTransform: 'none',
                            height: 32,
                            px: 1.5,
                            fontSize: '0.8125rem',
                            minWidth: 'unset',
                            bgcolor: 'action.hover',
                            color: 'text.disabled',
                            border: '1px solid transparent !important',
                            '&:hover, &.Mui-selected, &.Mui-selected:hover': {
                                ...categoryChipSx(cat.color),
                                border: `1px solid ${cat.color} !important`,
                            },
                        }}
                    >
                        {cat.name.toLowerCase()}
                    </ToggleButton>
                ))}
            </ToggleButtonGroup>
            {onAdd && (
                <Box
                    component="button"
                    type="button"
                    onClick={onAdd}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        height: 32,
                        px: 1.5,
                        borderRadius: '16px',
                        border: '1px dashed',
                        borderColor: 'text.disabled',
                        bgcolor: 'transparent',
                        color: 'text.disabled',
                        fontSize: '0.8125rem',
                        cursor: 'pointer',
                        textTransform: 'none',
                        '&:hover': {
                            borderColor: 'text.primary',
                            color: 'text.primary',
                        },
                    }}
                >
                    <AddIcon sx={{ fontSize: 16 }} />
                </Box>
            )}
        </Box>
    );
}
