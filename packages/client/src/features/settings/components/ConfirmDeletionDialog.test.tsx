import userEvent from "@testing-library/user-event";
import ConfirmDeletionDialog from "./ConfirmDeletionDialog";
import { screen, render } from "@testing-library/react";

const mockOnConfirm = vi.fn();
const mockOnCancel = vi.fn();

describe('ConfirmDeletionDialog', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the dialog with the correct title and description', () => {
        render(<ConfirmDeletionDialog open={true} title="Delete Test Category?" description="Any products in this category will be reassigned to Other." onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);
        expect(screen.getByText('Delete Test Category?')).toBeInTheDocument();
        expect(screen.getByText(/Any products in this category will be reassigned to Other./i)).toBeInTheDocument();
    });

    it('calls onConfirm when Delete button is clicked', async () => {
        render(<ConfirmDeletionDialog open={true} title="Delete Test Category?" description="Any products in this category will be reassigned to Other." onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);
        await userEvent.click(screen.getByRole('button', { name: /delete/i }));
        expect(mockOnConfirm).toHaveBeenCalled();
    });

    it('calls onCancel when Cancel button is clicked', async () => {
        render(<ConfirmDeletionDialog open={true} title="Delete Test Category?" description="Any products in this category will be reassigned to Other." onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);
        await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
        expect(mockOnCancel).toHaveBeenCalled();
    });
});