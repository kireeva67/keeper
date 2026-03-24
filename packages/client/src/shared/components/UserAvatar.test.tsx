import { render, screen } from "@testing-library/react";
import { UserAvatar } from "./UserAvatar";

vi.mock('../api/useUser', () => ({
    useUser: () => ({ email: 'test@example.com' }),
}));

describe('UserAvatar', () => {
    it('displays the first letter of the email in uppercase', () => {
        render(<UserAvatar />);
        expect(screen.getByText('T')).toBeInTheDocument();
    });
});