import { act, renderHook } from "@testing-library/react";
import { useProductForm } from "./useProductForm";
import { addProduct } from "./addProduct";

vi.mock('./addProduct', () => ({
    addProduct: vi.fn(),
}));

describe('useProductForm', () => {
    it('does not submit a title of only spaces and shows an error instead', async () => {
        const { result } = renderHook(() => useProductForm({ onSuccess: vi.fn() }));
        act(() => result.current.setField('title', '   '));
        await act(() => result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.FormEvent<HTMLFormElement>));
        expect(result.current.titleError).toBe('Title is required');
        expect(addProduct).not.toHaveBeenCalled();
    });
});
