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
    titleError: string | null;
    formError: string | null;
    setField: <K extends keyof Product>(key: K, value: Product[K]) => void;
    setUrlError: (val: string | null) => void;
    setTitleError: (val: string | null) => void;
    handleSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

export function useProductForm({ initialData, onSuccess }: FormProps): UseProductFormReturn {
    const [values, setValues] = useState<Product>(initialData || { title: "", url: "", description: "", id: 0, category: { id: CATEGORY_ID[CategoryName.OTHER], name: CategoryName.OTHER, color: "#797979" } });
    const [submitting, setSubmitting] = useState(false);
    const [urlError, setUrlError] = useState<string | null>(null);
    const [titleError, setTitleError] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);

    function setField<K extends keyof Product>(key: K, value: Product[K]) {
        setValues((v) => ({ ...v, [key]: value }));
        setFormError(null);
    }

    // Only these two server errors are about the URL, and only the create form has a URL field.
    // "Invalid URL." is the message from POST /api/products (routes/products.ts).
    function isUrlError(err: HttpError) {
        return !initialData && (err.status === 409 || (err.status === 400 && err.message === "Invalid URL."));
    }

    async function submit() {
        if (submitting) {
            return;
        }
        setSubmitting(true);
        setUrlError(null);
        setFormError(null);
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
            const isClientError = err instanceof HttpError && (err.status === 400 || err.status === 409 || err.status === 429);
            if (isClientError && isUrlError(err)) {
                setUrlError(err.message);
            } else if (isClientError) {
                // Shown at the top of the dialog, so it stays until the user changes something.
                setFormError(err.message);
            } else {
                setFormError("Something went wrong. Please try again.");
            }
        } finally {
            setSubmitting(false);
        }
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        // The form is noValidate, so required fields are checked here. A title of
        // only spaces counts as empty, as the server rejects it.
        const missingTitle = !values.title.trim();
        const missingUrl = !initialData && !values.url.trim();
        if (missingTitle) setTitleError("Title is required");
        if (missingUrl) setUrlError("URL is required");
        if (missingTitle || missingUrl) return;
        await submit();
    }

    return { values, setField, submitting, handleSubmit, urlError, setUrlError, titleError, setTitleError, formError };
}