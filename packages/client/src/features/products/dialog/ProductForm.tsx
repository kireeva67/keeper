import { useState } from "react";
import { Alert, Button, DialogActions, TextField } from "@mui/material";
import type { Product } from "../../../shared/types/ProductType";
import { useProductForm } from "../api/useProductForm";
import CategoryPicker from "../categories/CategoryPicker";
import NewCategoryDialog from "./NewCategoryDialog";
import type { Category } from "../../../shared/types/CategoryType";
import { useProducts } from "../api/useProducts";
import { FieldLimits } from "../../../shared/utils/FieldLimits";

export type FormProps = {
  initialData?: Product; // If exists === edit mode
  onCancel?: () => void;
  onSuccess: (updatedProduct?: Product) => void;
};

export function ProductForm({ initialData, onCancel, onSuccess }: FormProps) {
  const isEdit = Boolean(initialData);
  const { values, setField, submitting, handleSubmit, urlError, setUrlError, titleError, setTitleError, formError } = useProductForm({ initialData, onSuccess });
  const { categories, addCategory } = useProducts();
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);

  const handleCategoryCreated = (category: Category) => {
    addCategory(category);
    setField("category", category);
  };

  return (
    // noValidate: required fields are checked in useProductForm and shown as MUI helper
    // text, instead of the browser's own "Please fill in this field" bubble.
    <form onSubmit={handleSubmit} noValidate>
      {formError && <Alert severity="error" sx={{ mt: 2 }}>{formError}</Alert>}
      <TextField
        value={values.title}
        onChange={(e) => { setField("title", e.target.value); if (titleError) setTitleError(null) }}
        slotProps={{ input: { name: "title" }, htmlInput: { maxLength: FieldLimits.titleMaxLength } }}
        label="Title"
        fullWidth
        required sx={{ mt: 2 }}
        error={Boolean(titleError)}
        helperText={titleError ?? `${values.title.length}/${FieldLimits.titleMaxLength}`}
      />
      {!isEdit &&
        <TextField
          value={values.url}
          onChange={(e) => { setField("url", e.target.value); if (urlError) setUrlError(null) }}
          slotProps={{ input: { name: "url" }, htmlInput: { autoComplete: "off" } }}
          label="URL"
          fullWidth
          required
          sx={{ mt: 2 }}
          error={Boolean(urlError)}
          helperText={urlError}
          disabled={isEdit}
        />}
      <TextField
        value={values.description}
        onChange={(e) => setField("description", e.target.value)}
        slotProps={{ input: { name: "description" }, htmlInput: { maxLength: FieldLimits.descriptionMaxLength } }}
        label="Description"
        fullWidth
        multiline
        rows={3}
        sx={{ mt: 2 }}
        helperText={`${values.description?.length}/${FieldLimits.descriptionMaxLength}`}
      />

      <CategoryPicker
        categories={categories}
        value={values.category.id}
        onChange={(id) => setField("category", categories.find(c => c.id === id)!)}
        onAdd={() => setAddCategoryOpen(true)}
      />
      <NewCategoryDialog
        open={addCategoryOpen}
        onClose={() => setAddCategoryOpen(false)}
        onCreated={handleCategoryCreated}
      />


      <DialogActions sx={{ px: 0, pt: 2 }}>
        <Button onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" disabled={submitting}>
          {isEdit ? "Save Changes" : "Create"}
        </Button>
      </DialogActions>
    </form>
  );
}
