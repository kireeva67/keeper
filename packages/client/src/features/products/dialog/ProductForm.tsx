import { useState } from "react";
import { Button, DialogActions, TextField } from "@mui/material";
import type { Product } from "../../../shared/types/ProductType";
import { useProductForm } from "../api/useProductForm";
import CategoryPicker from "../categories/CategoryPicker";
import NewCategoryDialog from "./NewCategoryDialog";
import type { Category } from "../../../shared/types/CategoryType";
import { useProducts } from "../api/useProducts";

export type FormProps = {
  initialData?: Product; // If exists === edit mode
  onCancel?: () => void;
  onSuccess: (updatedProduct?: Product) => void;
};

export function ProductForm({ initialData, onCancel, onSuccess }: FormProps) {
  const isEdit = Boolean(initialData);
  const { values, setField, submitting, handleSubmit, urlError, setUrlError } = useProductForm({ initialData, onSuccess });
  const { categories, addCategory } = useProducts();
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);

  const handleCategoryCreated = (category: Category) => {
    addCategory(category);
    setField("category", category);
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        value={values.title}
        onChange={(e) => setField("title", e.target.value)}
        slotProps={{ input: { name: "title" }, htmlInput: { maxLength: 20 } }}
        label="Title"
        fullWidth
        required sx={{ mt: 2 }}
        helperText={`${values.title.length}/20`}
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
        slotProps={{ input: { name: "description" }, htmlInput: { maxLength: 100 } }}
        label="Description"
        fullWidth
        multiline
        rows={3}
        sx={{ mt: 2 }}
        helperText={`${values.description?.length}/100`}
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
