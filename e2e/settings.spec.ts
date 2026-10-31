import { test, expect } from '@playwright/test';
import { KeeperApp } from './KeeperApp';

// Smoke checks 11-13. "Set password" (for Google-only accounts) is not covered.
test.describe('settings', () => {
    let app: KeeperApp;
    let email: string;

    test.beforeEach(async ({ page }) => {
        app = new KeeperApp(page);
        email = await app.signUp();
        await app.openSettings();
    });

    test('11. settings show the account email', async ({ page }) => {
        await expect(page.getByText(email, { exact: true })).toBeVisible();
    });

    test('12. password account sees "Update password"', async ({ page }) => {
        await expect(page.getByRole('button', { name: 'Update password' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Set password' })).toBeHidden();
    });

    test('12b. password can be changed and used to log in', async ({ page }) => {
        // Known bug: the "Current password" field in ProfileSection.tsx is bound to the
        // new password state, so the change never reaches the server. It currently fails
        // at the "Password updated successfully" check. Remove test.fail() once it is
        // fixed; Playwright reports an error when this test starts passing.
        test.fail(true, 'Known bug: "Current password" field is bound to the new password');
        const newPassword = 'E2e-new-456!';

        await page.getByLabel('Current password').fill(app.password);
        await page.getByLabel('New password').fill(newPassword);
        await page.getByRole('button', { name: 'Update password' }).click();
        await expect(page.getByText('Password updated successfully')).toBeVisible();

        await app.page.goto('/products');
        await app.logOut();
        await app.logIn(email, newPassword);
        await expect(page).toHaveURL(/\/products$/);
    });

    test('13. deleting the account logs out and the login stops working', async ({ page }) => {
        await page.getByRole('button', { name: 'Delete account' }).click();
        const confirm = page.getByRole('dialog', { name: 'Delete account?' });
        await confirm.getByRole('button', { name: 'Delete' }).click();
        await expect(page).toHaveURL(/\/login$/);

        await app.logIn(email);

        await expect(page.getByText('Email or password is incorrect').first()).toBeVisible();
    });
});
