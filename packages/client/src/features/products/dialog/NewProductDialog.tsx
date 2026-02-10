import { Dialog, DialogTitle, DialogContent } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { PRODUCTS_ROUTE } from "../../auth/config/authURLS";
import type { LocationState } from "../../../shared/types/LocationType";
import { NewProductForm } from "./NewProductForm";

export default function NewProductDialog({ fullPage = false }: { fullPage?: boolean }) {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const isModal = Boolean(state?.background) && !fullPage;

  const handleClose = () => {
    const state = location.state as { background?: Location } | undefined;
    if (state?.background) {
      navigate(-1);
    } else {
      navigate(PRODUCTS_ROUTE);
    }
  };

  const content = (
    <NewProductForm
      onCancel={handleClose}
      onSuccess={handleClose}
    />
  );

  return isModal ? (
    <Dialog open onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>New product</DialogTitle>
      <DialogContent>{content}</DialogContent>
    </Dialog>
  ) : (
    <div style={{ maxWidth: 640, margin: "64px auto", padding: 16 }}>
      <h1>New product</h1>
      {content}
    </div>
  );
}
