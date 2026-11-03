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
        categories: [{ id: 2, name: 'Books', color: '#000000' }, { id: 3, name: 'Films', color: '#000000' }],
        categoriesIds: [],
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

    it('shows skeleton cards while the first page loads', () => {
        mockList({ loading: true, hasMore: true });
        render(<MemoryRouter><ProductList /></MemoryRouter>);
        expect(screen.getByRole('status', { name: 'Loading your items' })).toBeInTheDocument();
        expect(screen.queryByText('Nothing saved yet')).not.toBeInTheDocument();
    });

    it('shows an empty state when nothing is saved', () => {
        mockList({});
        render(<MemoryRouter><ProductList /></MemoryRouter>);
        expect(screen.getByText('Nothing saved yet')).toBeInTheDocument();
        expect(screen.getByText('Tap + to save your first link.')).toBeInTheDocument();
    });

    it('names the category when a filter has no items', () => {
        mockList({ categoriesIds: [2] });
        render(<MemoryRouter><ProductList /></MemoryRouter>);
        expect(screen.getByText('Nothing in books yet')).toBeInTheDocument();
    });

    it('says "these categories" when several filters have no items', () => {
        mockList({ categoriesIds: [2, 3] });
        render(<MemoryRouter><ProductList /></MemoryRouter>);
        expect(screen.getByText('Nothing in these categories yet')).toBeInTheDocument();
    });

    it('uses generic filter text when the selected category is unknown', () => {
        mockList({ categoriesIds: [5], categories: [] });
        render(<MemoryRouter><ProductList /></MemoryRouter>);
        expect(screen.getByText('Nothing in these categories yet')).toBeInTheDocument();
        expect(screen.queryByText('Nothing saved yet')).not.toBeInTheDocument();
    });

    it('keeps Load More instead of the empty state when more pages remain', () => {
        mockList({ hasMore: true });
        render(<MemoryRouter><ProductList /></MemoryRouter>);
        expect(screen.getByRole('button', { name: 'Load More' })).toBeInTheDocument();
        expect(screen.queryByText('Nothing saved yet')).not.toBeInTheDocument();
    });

    it('keeps loaded items visible while a reload is in flight', () => {
        mockList({ products: [product], loading: true });
        render(<MemoryRouter><ProductList /></MemoryRouter>);
        expect(screen.getByText('Lamp')).toBeInTheDocument();
        expect(screen.queryByRole('status', { name: 'Loading your items' })).not.toBeInTheDocument();
    });
});
