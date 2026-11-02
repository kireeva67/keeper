import { render, screen } from "@testing-library/react";
import NewCategoryDialog from "./NewCategoryDialog";

vi.mock('../api/addCategory', () => ({
    addCategory: vi.fn(),
}));

describe('NewCategoryDialog', () => {
    it('limits the name to 24 characters and shows the count', () => {
        render(<NewCategoryDialog open onClose={vi.fn()} onCreated={vi.fn()} />);
        expect(screen.getByLabelText(/name/i)).toHaveAttribute('maxLength', '24');
        expect(screen.getByText('0/24')).toBeInTheDocument();
    });
});
