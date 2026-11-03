import { useEffect, useRef, useState } from "react";
import { Alert, TextField } from "@mui/material";
import type { Product } from "../../../shared/types/ProductType";
import { useProductForm } from "../api/useProductForm";
import CategoryPicker from "../categories/CategoryPicker";
import NewCategoryView from "./NewCategoryView";
import type { Category } from "../../../shared/types/CategoryType";
import { useProducts } from "../api/useProducts";
import { FieldLimits } from "../../../shared/utils/FieldLimits";
import { FormActions } from "./FormActions";

export type FormProps = {
  initialData?: Product; // If exists === edit mode
  onCancel?: () => void;
  onSuccess: (updatedProduct?: Product) => void;
  // Lets the dialog show "New category" as its title while the category view is open.
  onAddingCategoryChange?: (adding: boolean) => void;
  topBarTitle?: string;
};

export function ProductForm({ initialData, onCancel, onSuccess, onAddingCategoryChange, topBarTitle }: FormProps) {
  const isEdit = Boolean(initialData);
  const { values, setField, submitting, handleSubmit, urlError, setUrlError, titleError, setTitleError, formError } = useProductForm({ initialData, onSuccess });
  const { categories, addCategory } = useProducts();
  const [addingCategory, setAddingCategoryState] = useState(false);
  const addCategoryButtonRef = useRef<HTMLButtonElement>(null);
  const wasAddingCategory = useRef(false);

  // The form is hidden while the category view is shown, so focus is lost on the way
  // back. Return it to the "+" button the user started from.
  useEffect(() => {
    if (wasAddingCategory.current && !addingCategory) {
      addCategoryButtonRef.current?.focus();
    }
    wasAddingCategory.current = addingCategory;
  }, [addingCategory]);

  const setAddingCategory = (adding: boolean) => {
    setAddingCategoryState(adding);
    onAddingCategoryChange?.(adding);
  };

  const handleCategoryCreated = (category: Category) => {
    addCategory(category);
    setField("category", category);
    setAddingCategory(false);
  };

  const actions = (
    <FormActions
      submitLabel={isEdit ? "Save Changes" : "Create"}
      submitting={submitting}
      onDismiss={() => onCancel?.()}
      dismissAs="close"
      topBarTitle={topBarTitle}
    />
  );

  return (
    <>
      {/* noValidate: required fields are checked in useProductForm and shown as MUI helper
          text, instead of the browser's own "Please fill in this field" bubble.
          hidden, not unmounted, while adding a category, so typed values are kept. */}
      <form onSubmit={handleSubmit} noValidate hidden={addingCategory}>
        {topBarTitle && !addingCategory && actions}
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
          onAdd={() => setAddingCategory(true)}
          addButtonRef={addCategoryButtonRef}
        />

        {!topBarTitle && actions}
      </form>
      {addingCategory &&
        <NewCategoryView
          onBack={() => setAddingCategory(false)}
          onCreated={handleCategoryCreated}
          topBarTitle={topBarTitle ? "New category" : undefined}
        />}
    </>
  );
}
