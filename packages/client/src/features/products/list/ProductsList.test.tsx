import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { ProductList } from "./ProductsList";
import { useProducts } from "../api/useProducts";

vi.mock('../api/useProducts', () => ({
    useProducts: vi.fn(),
}));

vi.mock('../../../shared/snackbar/useSnackbar', () => ({
    useSnackbar: () => ({ showError: vi.fn() }),
}));

const product = { id: 1, title: 'Lamp', url: 'https://shop.example.invalid/lamp', description: '', category: { id: 1, name: 'Other', color: '#000000' } };

function mockList(state: Record<string, unknown>) {
    vi.mocked(useProducts).mockReturnValue({
        products: [], hasMore: false, loading: false, loadError: false,
        loadMore: vi.fn(), retry: vi.fn(), deleteProductFromState: vi.fn(),
        ...state,
    } as unknown as ReturnType<typeof useProducts>);
}

describe('ProductList', () => {
    it('shows a Retry state when the first load fails', async () => {
        const retry = vi.fn();
        mockList({ loadError: true, retry });
        render(<MemoryRouter><ProductList /></MemoryRouter>);
        expect(screen.getByText("Couldn't load your items.")).toBeInTheDocument();
        await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
        expect(retry).toHaveBeenCalled();
    });

    it('keeps loaded items and offers to try again when "Load More" fails', async () => {
        const loadMore = vi.fn();
        mockList({ products: [product], hasMore: true, loadError: true, loadMore });
        render(<MemoryRouter><ProductList /></MemoryRouter>);
        expect(screen.getByText('Lamp')).toBeInTheDocument();
        expect(screen.getByText("Couldn't load more items.")).toBeInTheDocument();
        await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
        expect(loadMore).toHaveBeenCalled();
    });
});
