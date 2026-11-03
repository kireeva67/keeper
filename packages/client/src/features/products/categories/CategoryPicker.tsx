import type { Ref } from "react";
import { Box, ToggleButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import type { Category } from "../../../shared/types/CategoryType";
import { categoryChipSx } from "./categoryChipSx";

type Props = {
    categories: Category[];
    value: number;
    onChange: (id: number) => void;
    onAdd?: () => void;
    addButtonRef?: Ref<HTMLButtonElement>;
}

export default function CategoryPicker({ categories, value, onChange, onAdd, addButtonRef }: Props) {
    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2, alignItems: 'center' }}>
            <Box role="group" aria-label="Category" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {categories.map(cat => (
                    <ToggleButton key={cat.id} value={cat.id} size="small"
                        selected={cat.id === value}
                        onChange={() => onChange(cat.id)}
                        sx={{
                            borderRadius: '16px',
                            textTransform: 'none',
                            height: 32,
                            px: 1.5,
                            fontSize: '0.8125rem',
                            minWidth: 'unset',
                            bgcolor: 'action.hover',
                            color: 'text.secondary',
                            border: '1px solid transparent',
                            '&:hover, &.Mui-selected, &.Mui-selected:hover': {
                                ...categoryChipSx(cat.color),
                            },
                        }}
                    >
                        {cat.name.toLowerCase()}
                    </ToggleButton>
                ))}
            </Box>
            {onAdd && (
                <Box
                    component="button"
                    type="button"
                    ref={addButtonRef}
                    aria-label="New category"
                    onClick={onAdd}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        height: 32,
                        px: 1.5,
                        borderRadius: '16px',
                        border: '1px dashed',
                        borderColor: 'text.secondary',
                        bgcolor: 'transparent',
                        color: 'text.secondary',
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
