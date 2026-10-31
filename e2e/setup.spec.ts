import { test, expect } from '@playwright/test';

// Proves the e2e wiring works: the client is served and the test API answers.
test('signed-out visitor is sent to the login page', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();
});

test('test API is up and requires a session', async ({ request }) => {
    const response = await request.get('http://localhost:3201/api/healthCheck');

    expect(response.status()).toBe(401);
});
