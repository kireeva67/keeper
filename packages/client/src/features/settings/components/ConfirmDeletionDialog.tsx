import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

type Props = {
    open: boolean;
    categoryName: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmDeletionDialog({ open, categoryName, onConfirm, onCancel }: Props) {
    return (
        <Dialog open={open} onClose={onCancel}>
            <DialogTitle>Delete "{categoryName}"?</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Any products in this category will be reassigned to Other.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel}>Cancel</Button>
                <Button onClick={onConfirm} color="error" variant="contained">Delete</Button>
            </DialogActions>
        </Dialog>
    );
}
