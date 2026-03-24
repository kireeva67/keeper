import { screen, render } from "@testing-library/react";
import { ProductCard } from "./ProductCard";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { deleteProduct } from "../api/deleteProduct";

const mockProduct = {
    id: 1,
    title: "Test Product",
    description: "Test description",
    url: "https://example.com",
    imageUrl: undefined,
    category: { id: 1, name: "Test Category", color: "#000000" },
};

const mockdeleteProductFromState = vi.fn();

vi.mock('../api/useProducts', () => ({
    useProducts: () => ({ deleteProductFromState: mockdeleteProductFromState }),
}));

vi.mock('../api/deleteProduct', () => ({
    deleteProduct: vi.fn().mockResolvedValue(true),
}));

describe('ProductCard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders product information correctly', async () => {
        render(<MemoryRouter><ProductCard product={mockProduct} /></MemoryRouter>);
        expect(screen.getByText('Test Product')).toBeInTheDocument();
        expect(screen.getByText('Test description')).toBeInTheDocument();
        expect(screen.getByText(/Test Category/i)).toBeInTheDocument();
    });

    it('opens menu on more options click', async () => {
        render(<MemoryRouter><ProductCard product={mockProduct} /></MemoryRouter>);
        await userEvent.click(screen.getByRole('button', { name: /more options/i }));
        expect(screen.getByText('Edit')).toBeInTheDocument();
        expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('calls deleteProduct and deleteProductFromState on delete', async () => {
        render(<MemoryRouter><ProductCard product={mockProduct} /></MemoryRouter>);
        await userEvent.click(screen.getByRole('button', { name: /more options/i }));
        await userEvent.click(screen.getByText('Delete'));
        expect(deleteProduct).toHaveBeenCalledWith(1);
        expect(mockdeleteProductFromState).toHaveBeenCalledWith(1);
    });
});  