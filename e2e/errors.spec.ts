import { test, expect } from '@playwright/test';
import { KeeperApp } from './KeeperApp';

// Errors the server or network can cause, simulated with page.route so no real
// failure is needed. Errors in a dialog show at its top; errors from an action
// with no form open (like delete) show in the snackbar.
test.describe('error handling', () => {
    let app: KeeperApp;

    test.beforeEach(async ({ page }) => {
        app = new KeeperApp(page);
        await app.signUp();
    });

    test('a failed list load shows Retry, and Retry loads the list', async ({ page }) => {
        await app.addProduct('Still here', 'still-here');
        let failing = true;
        await page.route('**/api/products?*', route => failing
            ? route.fulfill({ status: 500, json: { message: 'Could not load your products.' } })
            : route.fallback());

        await page.reload();
        await expect(page.getByText("Couldn't load your items.")).toBeVisible();

        failing = false;
        await page.getByRole('button', { name: 'Retry' }).click();
        await expect(app.card('Still here')).toBeVisible();
        await expect(page.getByText("Couldn't load your items.")).toBeHidden();
    });

    test('a server error while editing shows at the top of the dialog until a field changes', async ({ page }) => {
        await app.addProduct('Edit fails', 'edit-fails');
        await page.route('**/api/products/*', route => route.request().method() === 'PUT'
            ? route.fulfill({ status: 400, json: { message: 'Category not found.' } })
            : route.fallback());

        await app.card('Edit fails').getByRole('button', { name: 'more options' }).click();
        await page.getByRole('menuitem', { name: 'Edit' }).click();
        const edit = page.getByRole('dialog', { name: 'Edit Product' });
        await edit.getByLabel('Title').fill('Changed');
        await edit.getByRole('button', { name: 'Save Changes' }).click();

        await expect(edit.getByRole('alert').filter({ hasText: 'Category not found.' })).toBeVisible();

        await edit.getByLabel('Title').fill('Changed again');
        await expect(edit.getByRole('alert')).toBeHidden();
    });

    test('a failed delete shows in the snackbar and keeps the card', async ({ page }) => {
        await app.addProduct('Delete fails', 'delete-fails');
        await page.route('**/api/products/*', route => route.request().method() === 'DELETE'
            ? route.fulfill({ status: 500, json: { message: 'Failed to delete product.' } })
            : route.fallback());

        await app.card('Delete fails').getByRole('button', { name: 'more options' }).click();
        await page.getByRole('menuitem', { name: 'Delete' }).click();

        await expect(page.getByRole('alert').filter({ hasText: "Couldn't delete this item." })).toBeVisible();
        await page.reload();
        await expect(app.card('Delete fails')).toBeVisible();
    });
});
