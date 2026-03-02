import { Dialog, DialogTitle, DialogContent, useTheme, useMediaQuery } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { PRODUCTS_ROUTE } from "../../auth/config/authURLS";
import type { LocationState } from "../../../shared/types/LocationType";
import { ProductForm } from "./ProductForm";
import { useProducts } from "../api/useProducts";
import type { Product } from "../../../shared/types/ProductType";

export default function NewProductDialog({ fullPage = false }: { fullPage?: boolean }) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const state = location.state as LocationState | null;
  const isModal = Boolean(state?.background) && !fullPage;
  const { addProductToState } = useProducts();

  const handleClose = () => {
    const state = location.state as { background?: Location } | undefined;
    if (state?.background) {
      navigate(-1);
    } else {
      navigate(PRODUCTS_ROUTE);
    }
  };

  const handleSuccess = (newProduct?: Product) => {
    if (newProduct) {
      addProductToState(newProduct);
      document.getElementById('scroll-container')?.scrollTo({ top: 0, behavior: 'smooth' });
    }
    handleClose();
  };

  const content = (
    <ProductForm
      onCancel={handleClose}
      onSuccess={handleSuccess}
    />
  );

  return isModal ? (
    <Dialog open onClose={handleClose} fullWidth maxWidth="sm" fullScreen={isMobile}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'center' }}>New product</DialogTitle>
      <DialogContent sx={isMobile ? {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      } : undefined}>{content}</DialogContent>
    </Dialog>
  ) : (
    <div style={{ maxWidth: 640, margin: "64px auto", padding: 16 }}>
      <h1>New product</h1>
      {content}
    </div>
  );
}
