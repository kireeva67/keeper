import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Button, Portal, Snackbar, SnackbarContent } from "@mui/material";
import { SnackbarContext, type UndoOffer } from "./useSnackbar";

type Notice = { text: string; undo?: UndoOffer };

// One app-wide snackbar for errors that have no field to show them next to, and for undo offers.
// Rendered in a Portal: an open dialog marks the rest of the app aria-hidden, and the
// snackbar must stay visible to screen readers when it reports an error from that dialog.
export function SnackbarProvider({ children }: { children: React.ReactNode }) {
    const [notice, setNotice] = useState<Notice | null>(null);
    const [open, setOpen] = useState(false);
    // A new key per message restarts the auto-hide timer when a second message replaces the first.
    const [messageKey, setMessageKey] = useState(0);
    const openUndoOfferRef = useRef<UndoOffer | null>(null);

    const takeUndoOffer = () => {
        const offer = openUndoOfferRef.current;
        openUndoOfferRef.current = null;
        return offer;
    };

    const dismissUndoOffer = useCallback(() => takeUndoOffer()?.onDismiss(), []);

    const show = useCallback((next: Notice) => {
        dismissUndoOffer();
        openUndoOfferRef.current = next.undo ?? null;
        setNotice(next);
        setMessageKey(k => k + 1);
        setOpen(true);
    }, [dismissUndoOffer]);

    const showError = useCallback((text: string) => show({ text }), [show]);
    const showUndo = useCallback((text: string, undo: UndoOffer) => show({ text, undo }), [show]);

    // Leaving the page (switching apps on a phone, closing the tab) ends the offer, so the delete is sent while the page can still send it.
    useEffect(() => {
        const dismissWhenHidden = () => {
            if (document.visibilityState !== "hidden" || !openUndoOfferRef.current) return;
            dismissUndoOffer();
            setOpen(false);
        };
        document.addEventListener("visibilitychange", dismissWhenHidden);
        return () => document.removeEventListener("visibilitychange", dismissWhenHidden);
    }, [dismissUndoOffer]);

    const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === "clickaway") return;
        dismissUndoOffer();
        setOpen(false);
    };

    const handleUndo = () => {
        takeUndoOffer()?.onUndo();
        setOpen(false);
    };

    return (
        <SnackbarContext.Provider value={{ showError, showUndo }}>
            {children}
            <Portal>
                <Snackbar key={messageKey} open={open} autoHideDuration={notice?.undo ? 5000 : 6000} onClose={handleClose}
                    anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                >
                    {notice?.undo ? (
                        <SnackbarContent message={notice.text}
                            action={<Button color="inherit" size="small" onClick={handleUndo} sx={{ fontWeight: 600, minHeight: 44, px: 2 }}>Undo</Button>}
                        />
                    ) : (
                        <Alert onClose={handleClose} severity="error" variant="filled" sx={{ width: "100%" }}>
                            {notice?.text}
                        </Alert>
                    )}
                </Snackbar>
            </Portal>
        </SnackbarContext.Provider>
    );
}
