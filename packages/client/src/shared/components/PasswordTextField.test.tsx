import userEvent from "@testing-library/user-event";
import { PasswordTextField } from "./PasswordTextField";
import { render, screen } from '@testing-library/react';

describe('PasswordTextField', () => {
    it('default type is password', async () => {
        render(<PasswordTextField label="Password" />);
        expect(screen.getByLabelText(/Password/i)).toHaveAttribute('type', 'password');
    });
    it('toggles to text on first click', async () => {
        render(<PasswordTextField label="Password" />);
        await userEvent.click(screen.getByRole('button', { name: /toggle visibility/i }));
        expect(screen.getByLabelText(/Password/i)).toHaveAttribute('type', 'text');
    });
    it('toggles to password on second click', async () => {
        render(<PasswordTextField label="Password" />);
        const btn = screen.getByRole('button', { name: /toggle visibility/i });
        await userEvent.click(btn);
        await userEvent.click(btn);
        expect(screen.getByLabelText(/Password/i)).toHaveAttribute('type', 'password');
    });
});