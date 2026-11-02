import { useState } from "react";
import { Box, Button, Chip, DialogActions, IconButton, TextField, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckIcon from "@mui/icons-material/Check";
import type { Category } from "../../../shared/types/CategoryType";
import { addCategory } from "../api/addCategory";
import { FieldLimits } from "../../../shared/utils/FieldLimits";
import { categoryChipSx } from "../categories/categoryChipSx";

const PRESET_COLORS = [
    { name: 'Red', value: '#c62828' },
    { name: 'Pink', value: '#ad1457' },
    { name: 'Purple', value: '#6a1b9a' },
    { name: 'Blue', value: '#1565c0' },
    { name: 'Teal', value: '#00695c' },
    { name: 'Green', value: '#2e7d32' },
    { name: 'Orange', value: '#e65100' },
    { name: 'Yellow', value: '#f57f17' },
    { name: 'Brown', value: '#4e342e' },
    { name: 'Light blue', value: '#0277bd' },
    { name: 'Light green', value: '#558b2f' },
    { name: 'Slate', value: '#37474f' },
];

type Props = {
    onBack: () => void;
    onCreated: (category: Category) => void;
};

// Shown in place of the product form, inside the same dialog, so two dialogs never stack.
export default function NewCategoryView({ onBack, onCreated }: Props) {
    const [name, setName] = useState("");
    const [color, setColor] = useState(PRESET_COLORS[0].value);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError("Name is required");
            return;
        }
        setSubmitting(true);
        try {
            const created = await addCategory({ name, color });
            onCreated(created);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create category.");
            setSubmitting(false);
        }
    };

    // Escape goes back to the product form. Stopping it here keeps the dialog's own
    // Escape handler (on the modal root) from closing the whole product dialog.
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            e.stopPropagation();
            if (!submitting) onBack();
        }
    };

    return (
        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} noValidate>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <IconButton onClick={onBack} aria-label="Back to product" edge="start" disabled={submitting}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h6" component="h3" fontWeight={600}>New category</Typography>
            </Box>
            <TextField
                value={name}
                onChange={(e) => { setName(e.target.value); if (error) setError(null); }}
                label="Name"
                fullWidth
                required
                autoFocus
                sx={{ mt: 2 }}
                slotProps={{ htmlInput: { maxLength: FieldLimits.categoryNameMaxLength } }}
                helperText={error ?? `${name.length}/${FieldLimits.categoryNameMaxLength}`}
                error={Boolean(error)}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Color</Typography>
            <Box
                role="group"
                aria-label="Color"
                sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 28px)', gap: 1.5, mt: 1, p: '5px' }}
            >
                {PRESET_COLORS.map(c => {
                    const selected = color === c.value;
                    return (
                        <Box
                            key={c.value}
                            component="button"
                            type="button"
                            aria-label={c.name}
                            aria-pressed={selected}
                            onClick={() => setColor(c.value)}
                            sx={{
                                width: 28,
                                height: 28,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '50%',
                                bgcolor: c.value,
                                color: 'common.white',
                                border: 'none',
                                cursor: 'pointer',
                                outline: selected ? `3px solid ${c.value}` : '3px solid transparent',
                                outlineOffset: '2px',
                                p: 0,
                                '&:focus-visible': { outline: '3px solid', outlineColor: 'text.primary' },
                            }}
                        >
                            {selected && <CheckIcon sx={{ fontSize: 18 }} />}
                        </Box>
                    );
                })}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                <Typography variant="body2" color="text.secondary">Preview</Typography>
                <Chip
                    label={name.trim().toLowerCase() || 'category'}
                    size="small"
                    sx={{ ...categoryChipSx(color), fontWeight: 500 }}
                />
            </Box>
            <DialogActions sx={{ px: 0, pt: 2 }}>
                <Button onClick={onBack} disabled={submitting}>Cancel</Button>
                <Button type="submit" variant="contained" disabled={submitting}>Add</Button>
            </DialogActions>
        </form>
    );
}
