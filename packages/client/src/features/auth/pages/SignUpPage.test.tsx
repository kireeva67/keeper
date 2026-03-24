import { screen, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SignUpPage from "./SignUpPage";
import userEvent from "@testing-library/user-event";
import { addUser } from "../api/addUser";

const mockSetAuthenticated = vi.fn();

vi.mock('../api/useAuth', () => ({
    useAuth: () => ({ setAuthenticated: mockSetAuthenticated }),
}));

vi.mock('../api/addUser', () => ({
    addUser: vi.fn(),
}));

describe('SignUpPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('calls setAuthenticated and navigates on successful sign up', async () => {
        vi.mocked(addUser).mockResolvedValueOnce({} as never);
        render(<MemoryRouter><SignUpPage /></MemoryRouter>);
        await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
        await userEvent.type(screen.getByLabelText(/password/i), 'ValidPass1!');
        await userEvent.click(screen.getByRole('button', { name: /create account/i }));
        expect(mockSetAuthenticated).toHaveBeenCalledWith(true);
    });
    it('shows an error when email is already in use', async () => {
        vi.mocked(addUser).mockRejectedValueOnce({ status: 409, message: "Email already in use" });
        render(<MemoryRouter><SignUpPage /></MemoryRouter>);
        await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
        await userEvent.type(screen.getByLabelText(/password/i), 'ValidPass1!');
        await userEvent.click(screen.getByRole('button', { name: /create account/i }));
        expect(screen.getByText(/email already in use/i)).toBeInTheDocument();
    });

    it('shows an error when password is empty', async () => {
        render(<MemoryRouter><SignUpPage /></MemoryRouter>);
        await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
        await userEvent.click(screen.getByRole('button', { name: /create account/i }));
        expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
    });
});
