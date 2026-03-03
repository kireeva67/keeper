import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { Category } from "../../../shared/types/CategoryType";
import { CATEGORY_COLORS } from "../defaults";

type Props = {
    categories: Category[];
    value: number;
    onChange: (id: number) => void;
}

export default function CategoryPicker({ categories, value, onChange }: Props) {
    return (
        <ToggleButtonGroup
            value={value}
            exclusive
            onChange={(_, newId) => { if (newId) onChange(newId) }}
            sx={{ flexWrap: 'wrap', gap: 1, mt: 2, }}
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
                            bgcolor: alpha(CATEGORY_COLORS[cat.name], 0.25),
                            color: CATEGORY_COLORS[cat.name],
                            border: `1px solid ${CATEGORY_COLORS[cat.name]} !important`,
                        },
                    }}
                >
                    {cat.name.toLowerCase()}
                </ToggleButton>
            ))}
        </ToggleButtonGroup>

    );
}