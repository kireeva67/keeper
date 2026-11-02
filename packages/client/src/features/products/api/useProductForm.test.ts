import { act, renderHook } from "@testing-library/react";
import { useProductForm } from "./useProductForm";
import { addProduct } from "./addProduct";
import { updateProduct } from "./updateProduct";
import { HttpError } from "../../../shared/errors/HTTPError";
import type { Product } from "../../../shared/types/ProductType";

vi.mock('./updateProduct', () => ({
    updateProduct: vi.fn(),
}));

const submitEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent<HTMLFormElement>;
const existing: Product = { id: 7, title: 'Lamp', url: 'https://shop.example.invalid/lamp', description: '', category: { id: 99, name: 'Gone', color: '#000000' } };

vi.mock('./addProduct', () => ({
    addProduct: vi.fn(),
}));

describe('useProductForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('does not submit a title of only spaces and shows an error instead', async () => {
        const { result } = renderHook(() => useProductForm({ onSuccess: vi.fn() }));
        act(() => result.current.setField('title', '   '));
        await act(() => result.current.handleSubmit(submitEvent));
        expect(result.current.titleError).toBe('Title is required');
        expect(addProduct).not.toHaveBeenCalled();
    });

    it('shows "URL is required" for an empty URL in create mode, without submitting', async () => {
        const { result } = renderHook(() => useProductForm({ onSuccess: vi.fn() }));
        act(() => result.current.setField('title', 'Lamp'));
        await act(() => result.current.handleSubmit(submitEvent));
        expect(result.current.urlError).toBe('URL is required');
        expect(addProduct).not.toHaveBeenCalled();
    });

    it('in create mode shows a 409 under the URL field', async () => {
        vi.mocked(addProduct).mockRejectedValueOnce(new HttpError(409, 'This URL is already in your collection.'));
        const { result } = renderHook(() => useProductForm({ onSuccess: vi.fn() }));
        act(() => result.current.setField('title', 'Lamp'));
        act(() => result.current.setField('url', 'https://shop.example.invalid/lamp'));
        await act(() => result.current.handleSubmit(submitEvent));
        expect(result.current.urlError).toBe('This URL is already in your collection.');
        expect(result.current.formError).toBeNull();
    });

    it('in create mode shows a rate limit at the top of the form, not under the URL', async () => {
        vi.mocked(addProduct).mockRejectedValueOnce(new HttpError(429, 'Too many products added. Try again later.'));
        const { result } = renderHook(() => useProductForm({ onSuccess: vi.fn() }));
        act(() => result.current.setField('title', 'Lamp'));
        act(() => result.current.setField('url', 'https://shop.example.invalid/lamp'));
        await act(() => result.current.handleSubmit(submitEvent));
        expect(result.current.formError).toBe('Too many products added. Try again later.');
        expect(result.current.urlError).toBeNull();
    });

    it('in edit mode shows a 400 at the top of the form, and changing a field clears it', async () => {
        vi.mocked(updateProduct).mockRejectedValueOnce(new HttpError(400, 'Category not found.'));
        const onSuccess = vi.fn();
        const { result } = renderHook(() => useProductForm({ initialData: existing, onSuccess }));
        await act(() => result.current.handleSubmit(submitEvent));
        expect(result.current.formError).toBe('Category not found.');
        expect(onSuccess).not.toHaveBeenCalled();

        act(() => result.current.setField('title', 'Lamp 2'));
        expect(result.current.formError).toBeNull();
    });

    it('shows a generic message for an unexpected error', async () => {
        vi.mocked(updateProduct).mockRejectedValueOnce(new TypeError('Failed to fetch'));
        const { result } = renderHook(() => useProductForm({ initialData: existing, onSuccess: vi.fn() }));
        await act(() => result.current.handleSubmit(submitEvent));
        expect(result.current.formError).toBe('Something went wrong. Please try again.');
    });
});
