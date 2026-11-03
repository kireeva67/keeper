import { createContext, useContext } from "react";

// onDismiss runs once when the offer ends without Undo: timeout, Escape, a newer message or leaving the page.
export type UndoOffer = { onUndo: () => void; onDismiss: () => void };

type SnackbarContextType = {
    showError: (message: string) => void;
    showUndo: (message: string, undo: UndoOffer) => void;
};

export const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export const useSnackbar = () => {
    const context = useContext(SnackbarContext);
    if (!context) throw new Error("useSnackbar must be used within a SnackbarProvider");
    return context;
};
