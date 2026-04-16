import { useState } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from "@mui/material";
import type { Category } from "../../../shared/types/CategoryType";
import { addCategory } from "../api/addCategory";

const PRESET_COLORS = [
    '#c62828',
    '#ad1457',
    '#6a1b9a',
    '#1565c0',
    '#00695c',
    '#2e7d32',
    '#e65100',
    '#f57f17',
    '#4e342e',
    '#0277bd',
    '#558b2f',
    '#37474f',
];

type Props = {
    open: boolean;
    onClose: () => void;
    onCreated: (category: Category) => void;
};

export default function NewCategoryDialog({ open, onClose, onCreated }: Props) {
    const [name, setName] = useState("");
    const [color, setColor] = useState(PRESET_COLORS[0]);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleClose = () => {
        setName("");
        setColor(PRESET_COLORS[0]);
        setError(null);
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setSubmitting(true);
        try {
            const created = await addCategory({ name, color });
            onCreated(created);
            handleClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create category.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
            <DialogTitle>New category</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        value={name}
                        onChange={(e) => { setName(e.target.value); if (error) setError(null); }}
                        label="Name"
                        fullWidth
                        required
                        autoFocus
                        slotProps={{ htmlInput: { maxLength: 10 } }}
                        helperText={error ?? `${name.length}/10`}
                        error={Boolean(error)}
                    />
                    <Box>
                        <Typography variant="caption" color="text.secondary">Color</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                            {PRESET_COLORS.map(c => (
                                <Box
                                    key={c}
                                    component="button"
                                    type="button"
                                    onClick={() => setColor(c)}
                                    sx={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: '50%',
                                        bgcolor: c,
                                        border: 'none',
                                        cursor: 'pointer',
                                        outline: color === c ? `3px solid ${c}` : '3px solid transparent',
                                        outlineOffset: '2px',
                                        p: 0,
                                    }}
                                />
                            ))}
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} disabled={submitting}>Cancel</Button>
                    <Button type="submit" variant="contained" disabled={submitting || !name.trim()}
                        sx={{ bgcolor: color, '&:hover': { bgcolor: color, filter: 'brightness(0.9)' } }}
                    >
                        Create
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
