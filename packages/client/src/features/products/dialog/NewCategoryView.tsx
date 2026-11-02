import { useState } from "react";
import { Box, Button, DialogActions, TextField, Typography } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import type { Category } from "../../../shared/types/CategoryType";
import { addCategory } from "../api/addCategory";
import { FieldLimits } from "../../../shared/utils/FieldLimits";

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
// The dialog title changes to "New category" while it is shown (see ProductForm).
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
                // As many 36px columns as fit (at least 8px apart), spread to the field's full width.
                sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, 36px)', justifyContent: 'space-between', columnGap: 1, rowGap: 1.5, mt: 1 }}
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
                                width: 36,
                                height: 36,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '50%',
                                bgcolor: c.value,
                                color: 'common.white',
                                border: 'none',
                                cursor: 'pointer',
                                // The selection ring is drawn inside the circle (colour ring, white
                                // gap, fill), so every swatch keeps the same size and stays aligned.
                                boxShadow: selected ? `inset 0 0 0 3px ${c.value}, inset 0 0 0 5px #fff` : 'none',
                                p: 0,
                                '&:focus-visible': { outline: '2px solid', outlineColor: 'text.primary', outlineOffset: '2px' },
                            }}
                        >
                            {selected && <CheckIcon sx={{ fontSize: 18 }} />}
                        </Box>
                    );
                })}
            </Box>
            <DialogActions sx={{ px: 0, pt: 4 }}>
                <Button onClick={onBack} disabled={submitting}>Cancel</Button>
                <Button type="submit" variant="contained" disabled={submitting}>Add</Button>
            </DialogActions>
        </form>
    );
}
