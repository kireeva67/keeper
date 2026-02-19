import { Button, DialogActions, TextField } from "@mui/material";
import { useState } from "react";
import { addProduct } from "../api/addProduct";
import type { Product } from "../../../shared/types/ProductType";
import { HttpError } from "../../../shared/errors/HTTPError";
import { updateProduct } from "../api/updateProduct";

type Props = {
  initialData?: Product; // If exists === edit mode
  onCancel?: () => void;
  onSuccess: (updatedProduct?: Product) => void;
};

interface UseProductFormReturn {
  values: Product;
  submitting: boolean;
  urlError: string | null;
  setField: <K extends keyof Product>(key: K, value: Product[K]) => void;
  setUrlError: (val: string | null) => void;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

export function ProductForm({ initialData, onCancel, onSuccess }: Props) {
  const isEdit = Boolean(initialData);
  const { values, setField, submitting, handleSubmit, urlError, setUrlError } = useProductForm({ initialData, onSuccess });

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
          slotProps={{ input: { name: "url" } }}
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

function useProductForm({ initialData, onSuccess }: Props): UseProductFormReturn {
  const [values, setValues] = useState<Product>(initialData || { title: "", url: "", description: "", id: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  function setField<K extends keyof Product>(key: K, value: Product[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function submit() {
    if (submitting) {
      return;
    }
    setSubmitting(true);
    setUrlError(null);
    try {
      if (initialData) {
        const updated = await updateProduct(initialData.id, values);
        onSuccess(updated);
      } else {
        const newProduct = await addProduct(values);
        onSuccess(newProduct);
      }
    } catch (err) {
      if (err instanceof HttpError && err.status === 401) {
        return;
      }
      if (err instanceof HttpError && err.status === 409) {
        setUrlError("You already have a product with this URL.");
      } else {
        alert("An unexpected error occurred.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submit();
  }

  return { values, setField, submitting, handleSubmit, urlError, setUrlError };
}
