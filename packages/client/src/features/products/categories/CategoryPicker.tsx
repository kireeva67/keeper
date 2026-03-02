import { ToggleButton, ToggleButtonGroup } from "@mui/material";
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
                    sx={{ borderRadius: '16px !important', border: '1px solid !important', bgcolor: CATEGORY_COLORS[cat.name], color: '#fff' }}
                >
                    {cat.name}
                </ToggleButton>
            ))}
        </ToggleButtonGroup>

    );
}