import { Box, Button, DialogActions, DialogTitle, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

type FormActionsProps = {
    submitLabel: string;
    submitting: boolean;
    onDismiss: () => void;
    dismissAs: 'close' | 'back';
    topBarTitle?: string;
};

export function FormActions({ submitLabel, submitting, onDismiss, dismissAs, topBarTitle }: FormActionsProps) {
    const submitButton = (
        <Button type="submit" variant="contained" disabled={submitting} sx={{ flexShrink: 0 }}>
            {submitLabel}
        </Button>
    );

    if (topBarTitle) {
        return (
            <Box sx={{ position: 'sticky', top: 0, zIndex: 1, bgcolor: 'background.paper', display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
                <IconButton edge="start" onClick={onDismiss} disabled={submitting}
                    aria-label={dismissAs === 'back' ? "Back" : "Cancel"}
                >
                    {dismissAs === 'back' ? <ArrowBackIcon /> : <CloseIcon />}
                </IconButton>
                <DialogTitle noWrap sx={{ p: 0, flex: 1, fontWeight: 600 }}>{topBarTitle}</DialogTitle>
                {submitButton}
            </Box>
        );
    }

    return (
        <DialogActions sx={{ px: 0, pt: 2 }}>
            <Button onClick={onDismiss} disabled={submitting}>Cancel</Button>
            {submitButton}
        </DialogActions>
    );
}
