import { test, expect } from '@playwright/test';
import { KeeperApp } from './KeeperApp';

// Smoke checks 6-10. The image part of check 7 needs a real site and is not covered here.
test.describe('products and categories', () => {
    let app: KeeperApp;

    test.beforeEach(async ({ page }) => {
        app = new KeeperApp(page);
        await app.signUp();
    });

    test('6. product without a chosen category goes to "Other"', async () => {
        await app.addProduct('No category', 'no-category');

        await expect(app.cardCategory('No category')).toHaveText('other');
    });

    test('7. product with a chosen category keeps it after reload', async ({ page }) => {
        await app.addProduct('A book', 'a-book', { category: 'books' });
        await expect(app.cardCategory('A book')).toHaveText('books');

        await page.reload();

        await expect(app.cardCategory('A book')).toHaveText('books');
    });

    test('8. editing the category survives a reload', async ({ page }) => {
        await app.addProduct('Edit me', 'edit-me', { category: 'books' });

        await app.card('Edit me').getByRole('button', { name: 'more options' }).click();
        await page.getByRole('menuitem', { name: 'Edit' }).click();
        const dialog = page.getByRole('dialog', { name: 'Edit Product' });
        await dialog.getByRole('button', { name: 'films', exact: true }).click();
        await dialog.getByRole('button', { name: 'Save Changes' }).click();
        await expect(dialog).toBeHidden();
        await expect(app.cardCategory('Edit me')).toHaveText('films');

        await page.reload();

        await expect(app.cardCategory('Edit me')).toHaveText('films');
    });

    test('adding a category swaps the product dialog content and keeps typed values', async ({ page }) => {
        await page.getByRole('button', { name: 'add product' }).click();
        const dialog = page.getByRole('dialog', { name: 'New product' });
        await dialog.getByLabel('Title').fill('Kept title');

        // The same dialog is retitled "New category"; Escape returns to the product form.
        await dialog.getByRole('button', { name: 'New category' }).click();
        const categoryView = page.getByRole('dialog', { name: 'New category' });
        await expect(categoryView).toBeVisible();
        await expect(page.getByRole('dialog')).toHaveCount(1);
        await page.keyboard.press('Escape');
        await expect(categoryView).toBeHidden();
        await expect(dialog.getByLabel('Title')).toHaveValue('Kept title');
        await expect(dialog.getByRole('button', { name: 'New category' })).toBeFocused();

        await dialog.getByRole('button', { name: 'New category' }).click();
        await categoryView.getByLabel('Name').fill('Swapped');
        await categoryView.getByRole('button', { name: 'Add', exact: true }).click();
        await expect(dialog.getByLabel('Title')).toHaveValue('Kept title');
        await expect(dialog.getByRole('button', { name: 'swapped', exact: true })).toHaveAttribute('aria-pressed', 'true');
    });

    test('9. deleting a custom category moves its products to "Other"', async ({ page }) => {
        await app.addProduct('Tagged', 'tagged', { newCategory: 'temp' });
        await expect(app.cardCategory('Tagged')).toHaveText('temp');

        await app.openSettings();
        const tag = page.locator('div').filter({ hasText: /^temp$/ });
        await tag.locator('button:has(svg[data-testid="CloseIcon"])').click();
        const confirm = page.getByRole('dialog', { name: 'Delete category "temp"?' });
        await confirm.getByRole('button', { name: 'Delete' }).click();
        await expect(confirm).toBeHidden();
        await expect(page.getByText('My categories')).toBeHidden();

        await page.goto('/products');

        await expect(app.cardCategory('Tagged')).toHaveText('other');
    });

    test('10. category filter shows only matching products', async ({ page }) => {
        await app.addProduct('Book item', 'book-item', { category: 'books' });
        await app.addProduct('Film item', 'film-item', { category: 'films' });

        await page.getByRole('button', { name: /^books/ }).click();

        await expect(app.card('Book item')).toBeVisible();
        await expect(app.card('Film item')).toBeHidden();

        await page.getByRole('button', { name: /^all/ }).click();

        await expect(app.card('Book item')).toBeVisible();
        await expect(app.card('Film item')).toBeVisible();
    });

    test('a new account sees the empty state, and an empty filter names its category', async ({ page }) => {
        await expect(page.getByText('Nothing saved yet')).toBeVisible();

        await page.getByRole('button', { name: /^films/ }).click();

        await expect(page.getByText('Nothing in films yet')).toBeVisible();
    });
});
