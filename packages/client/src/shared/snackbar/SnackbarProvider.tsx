import { useCallback, useState } from "react";
import { Alert, Portal, Snackbar } from "@mui/material";
import { SnackbarContext } from "./useSnackbar";

// One app-wide snackbar for errors that have no field to show them next to.
// Rendered in a Portal: an open dialog marks the rest of the app aria-hidden, and the
// snackbar must stay visible to screen readers when it reports an error from that dialog.
export function SnackbarProvider({ children }: { children: React.ReactNode }) {
    const [message, setMessage] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    // A new key per message restarts the auto-hide timer when a second error replaces the first.
    const [messageKey, setMessageKey] = useState(0);

    const showError = useCallback((text: string) => {
        setMessage(text);
        setMessageKey(k => k + 1);
        setOpen(true);
    }, []);

    const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === "clickaway") return;
        setOpen(false);
    };

    return (
        <SnackbarContext.Provider value={{ showError }}>
            {children}
            <Portal>
                <Snackbar key={messageKey} open={open} autoHideDuration={6000} onClose={handleClose}
                    anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                >
                    <Alert onClose={handleClose} severity="error" variant="filled" sx={{ width: "100%" }}>
                        {message}
                    </Alert>
                </Snackbar>
            </Portal>
        </SnackbarContext.Provider>
    );
}
