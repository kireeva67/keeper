import { useState } from "react";
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
  const [addingCategory, setAddingCategory] = useState(false);
  const productTitle = "New product";
  const title = addingCategory ? "New category" : productTitle;
  const actionsInTopBar = isModal && isMobile;

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
      onAddingCategoryChange={setAddingCategory}
      topBarTitle={actionsInTopBar ? productTitle : undefined}
    />
  );

  return isModal ? (
    <Dialog open onClose={handleClose} fullWidth maxWidth="sm" fullScreen={isMobile}>
      {!actionsInTopBar && <DialogTitle sx={{ display: 'flex', justifyContent: 'center' }}>{title}</DialogTitle>}
      <DialogContent sx={actionsInTopBar ? { pt: 0 } : undefined}>{content}</DialogContent>
    </Dialog>
  ) : (
    <div style={{ maxWidth: 640, margin: "64px auto", padding: 16 }}>
      <h1>{title}</h1>
      {content}
    </div>
  );
}
