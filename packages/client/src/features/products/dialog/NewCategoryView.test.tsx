import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { addCategory } from "../api/addCategory";
import NewCategoryView from "./NewCategoryView";

vi.mock('../api/addCategory', () => ({
    addCategory: vi.fn(),
}));

describe('NewCategoryView', () => {
    beforeEach(() => {
        vi.mocked(addCategory).mockReset();
    });

    it('limits the name to 24 characters and shows the count', () => {
        render(<NewCategoryView onBack={vi.fn()} onCreated={vi.fn()} />);
        expect(screen.getByLabelText(/name/i)).toHaveAttribute('maxLength', '24');
        expect(screen.getByText('0/24')).toBeInTheDocument();
    });

    it('keeps Add enabled and shows "Name is required" for a blank name', async () => {
        render(<NewCategoryView onBack={vi.fn()} onCreated={vi.fn()} />);
        await userEvent.type(screen.getByLabelText(/name/i), '  ');
        const add = screen.getByRole('button', { name: 'Add' });
        expect(add).toBeEnabled();
        await userEvent.click(add);
        expect(screen.getByText('Name is required')).toBeInTheDocument();
        expect(addCategory).not.toHaveBeenCalled();

        await userEvent.type(screen.getByLabelText(/name/i), 'Books');
        expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
    });

    it('marks the chosen color as pressed and sends it with the name', async () => {
        const created = { id: 7, name: 'Books', color: '#1565c0' };
        vi.mocked(addCategory).mockResolvedValue(created);
        const onCreated = vi.fn();
        render(<NewCategoryView onBack={vi.fn()} onCreated={onCreated} />);

        expect(screen.getByRole('button', { name: 'Red' })).toHaveAttribute('aria-pressed', 'true');
        await userEvent.click(screen.getByRole('button', { name: 'Blue' }));
        expect(screen.getByRole('button', { name: 'Blue' })).toHaveAttribute('aria-pressed', 'true');
        expect(screen.getByRole('button', { name: 'Red' })).toHaveAttribute('aria-pressed', 'false');

        await userEvent.type(screen.getByLabelText(/name/i), 'Books');
        expect(screen.getByText('books')).toBeInTheDocument();
        await userEvent.click(screen.getByRole('button', { name: 'Add' }));
        expect(addCategory).toHaveBeenCalledWith({ name: 'Books', color: '#1565c0' });
        expect(onCreated).toHaveBeenCalledWith(created);
    });

    it('goes back on Escape without letting the key reach the dialog', () => {
        const onBack = vi.fn();
        const outer = vi.fn();
        render(
            <div onKeyDown={outer}>
                <NewCategoryView onBack={onBack} onCreated={vi.fn()} />
            </div>
        );
        fireEvent.keyDown(screen.getByLabelText(/name/i), { key: 'Escape' });
        expect(onBack).toHaveBeenCalled();
        expect(outer).not.toHaveBeenCalled();
    });
});
