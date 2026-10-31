import { test, expect } from '@playwright/test';
import { KeeperApp } from './KeeperApp';

// Smoke checks 1-4 (Google login, check 5, is not covered).
test.describe('auth', () => {
    test('1. sign up lands on the products page', async ({ page }) => {
        const app = new KeeperApp(page);
        await app.signUp();

        await expect(page.getByRole('button', { name: 'add product' })).toBeVisible();
    });

    test('2. log out, then log back in', async ({ page }) => {
        const app = new KeeperApp(page);
        const email = await app.signUp();

        await app.logOut();
        // The session is really gone: a protected page sends us back to login.
        await page.goto('/products');
        await expect(page).toHaveURL(/\/login$/);
        await app.logIn(email);

        await expect(page).toHaveURL(/\/products$/);
    });

    test('3. wrong password shows an error and stays on login', async ({ page }) => {
        const app = new KeeperApp(page);
        const email = await app.signUp();
        await app.logOut();

        await app.logIn(email, 'Wrong-pass-999!');

        await expect(page.getByText('Email or password is incorrect').first()).toBeVisible();
        await expect(page).toHaveURL(/\/login$/);
    });

    test('4. email is case-insensitive and logs into the same account', async ({ page }) => {
        const app = new KeeperApp(page);
        const email = await app.signUp();
        await app.logOut();

        await app.logIn(email.toUpperCase());

        await expect(page).toHaveURL(/\/products$/);
        await app.openSettings();
        await expect(page.getByText(email, { exact: true })).toBeVisible();
    });
});
