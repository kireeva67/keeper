import { MemoryRouter } from "react-router-dom";
import LoginPage from "./LoginPage";
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { checkCredentials } from "../api/checkCredentials";

const mockSetAuthenticated = vi.fn();

vi.mock('../api/useAuth', () => ({
    useAuth: () => ({ setAuthenticated: mockSetAuthenticated }),
}));

vi.mock('../api/checkCredentials', () => ({
    checkCredentials: vi.fn(),
}));

describe('LoginPage', () => {
    it('calls setAuthenticated and navigates on successful login', async () => {
        vi.mocked(checkCredentials).mockResolvedValueOnce(true);
        render(<MemoryRouter><LoginPage /></MemoryRouter>);
        await userEvent.click(screen.getByRole('button', { name: /login/i }));
        expect(mockSetAuthenticated).toHaveBeenCalledWith(true);
    });
    it('shows an error when credentials are invalid', async () => {
        vi.mocked(checkCredentials).mockRejectedValueOnce(new Error());
        render(<MemoryRouter><LoginPage /></MemoryRouter>);
        await userEvent.click(screen.getByRole('button', { name: /login/i }));
        expect(screen.getAllByText(/email or password is incorrect/i)).toHaveLength(2);
    });
});
