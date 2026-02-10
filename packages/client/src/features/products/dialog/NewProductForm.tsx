import { Button, DialogActions, TextField } from "@mui/material";
import { useState } from "react";
import { addProduct } from "../api/addProduct";
import type { Product } from "../../../shared/types/ProductType";
import { HttpError } from "../../../shared/errors/HTTPError";

type Props = {
  onCancel?: () => void;
  onSuccess: () => void;
};

export function NewProductForm({ onCancel, onSuccess }: Props) {
  const { values, setField, submitting, handleSubmit } = useNewProductForm({ onSuccess });

  return (
    <form onSubmit={handleSubmit}>
      <TextField value={values.title} onChange={(e) => setField("title", e.target.value)} slotProps={{ input: { name: "title" } }} label="Title" fullWidth required sx={{ mt: 2 }} />
      <TextField value={values.url} onChange={(e) => setField("url", e.target.value)} slotProps={{ input: { name: "url" } }} label="URL" fullWidth required sx={{ mt: 2 }} />
      <TextField value={values.description} onChange={(e) => setField("description", e.target.value)} slotProps={{ input: { name: "description" } }} label="Description" fullWidth multiline rows={3} sx={{ mt: 2 }} />

      <DialogActions sx={{ px: 0, pt: 2 }}>
        <Button onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" disabled={submitting}>
          Create
        </Button>
      </DialogActions>
    </form>
  );
}

function useNewProductForm({ onSuccess }: Props) {
  const [values, setValues] = useState<Product>({ title: "", url: "", description: "" });
  const [submitting, setSubmitting] = useState(false);

  function setField<K extends keyof Product>(key: K, value: Product[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function submit() {
    if (submitting) {
      return;
    }
    setSubmitting(true);
    try {
      await addProduct(values);
      onSuccess();
    } catch (err) {
      if (err instanceof HttpError && err.status === 401) return;
      throw err;
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submit();
  }

  return { values, setField, submitting, handleSubmit };
}