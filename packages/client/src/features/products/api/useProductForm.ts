import { useState } from "react";
import { updateProduct } from "./updateProduct";
import { type Product, } from "../../../shared/types/ProductType";
import { addProduct } from "./addProduct";
import { HttpError } from "../../../shared/errors/HTTPError";
import type { FormProps } from "../dialog/ProductForm";
import { CATEGORY_ID, CategoryName } from "../../../shared/types/CategoryType";

interface UseProductFormReturn {
    values: Product;
    submitting: boolean;
    urlError: string | null;
    setField: <K extends keyof Product>(key: K, value: Product[K]) => void;
    setUrlError: (val: string | null) => void;
    handleSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

export function useProductForm({ initialData, onSuccess }: FormProps): UseProductFormReturn {
    const [values, setValues] = useState<Product>(initialData || { title: "", url: "", description: "", id: 0, category: { id: CATEGORY_ID[CategoryName.OTHER], name: CategoryName.OTHER, color: "#797979" } });
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
            if (err instanceof HttpError && (err.status === 400 || err.status === 409 || err.status === 429)) {
                setUrlError(err.message);
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