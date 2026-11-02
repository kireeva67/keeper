import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { addCategory } from "../api/addCategory";
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

    it('keeps Create enabled and shows "Name is required" for a blank name', async () => {
        render(<NewCategoryDialog open onClose={vi.fn()} onCreated={vi.fn()} />);
        await userEvent.type(screen.getByLabelText(/name/i), '  ');
        const create = screen.getByRole('button', { name: 'Create' });
        expect(create).toBeEnabled();
        await userEvent.click(create);
        expect(screen.getByText('Name is required')).toBeInTheDocument();
        expect(addCategory).not.toHaveBeenCalled();

        await userEvent.type(screen.getByLabelText(/name/i), 'Books');
        expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
    });
});
