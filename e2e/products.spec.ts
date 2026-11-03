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

    test('a filter change during a slow load shows the newest filter', async ({ page }) => {
        await app.addProduct('Book item', 'book-item', { category: 'books' });
        await app.addProduct('Film item', 'film-item', { category: 'films' });
        await page.route('**/api/products?categoryIds=*', async route => {
            const response = await route.fetch();
            await page.waitForTimeout(1000);
            await route.fulfill({ response });
        }, { times: 1 });
        const staleResponse = page.waitForResponse('**/api/products?categoryIds=*');

        const booksChip = page.getByRole('button', { name: /^books/ });
        await booksChip.click();
        await booksChip.click();
        await (await staleResponse).finished();
        await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 200)));

        await expect(booksChip).toHaveAttribute('aria-pressed', 'false');
        await expect(app.card('Film item')).toBeVisible();
        await expect(app.card('Book item')).toBeVisible();
    });

    test('Undo after delete brings the card back and the product is kept', async ({ page }) => {
        await app.addProduct('Undo me', 'undo-me');
        await app.card('Undo me').getByRole('button', { name: 'more options' }).click();
        await page.getByRole('menuitem', { name: 'Delete' }).click();
        await expect(app.card('Undo me')).toBeHidden();

        await page.getByRole('button', { name: 'Undo' }).click();

        await expect(app.card('Undo me')).toBeVisible();
        await page.reload();
        await expect(app.card('Undo me')).toBeVisible();
    });

    test('a delete without Undo stays hidden during a reload of the list and is saved when the offer ends', async ({ page }) => {
        await app.addProduct('Gone item', 'gone-item');
        await app.card('Gone item').getByRole('button', { name: 'more options' }).click();
        await page.getByRole('menuitem', { name: 'Delete' }).click();
        await expect(page.getByText('Item deleted')).toBeVisible();

        await page.getByRole('button', { name: /^other/ }).click();
        await expect(page.getByText('Nothing in other yet')).toBeVisible();

        await expect(page.getByText('Item deleted')).toBeHidden({ timeout: 10_000 });
        await page.reload();
        await expect(page.getByText('Nothing in other yet')).toBeVisible();
    });

    test('closing the tab during the undo offer still deletes the product', async ({ page, context }) => {
        await app.addProduct('Closed tab item', 'closed-tab-item');
        await app.card('Closed tab item').getByRole('button', { name: 'more options' }).click();
        await page.getByRole('menuitem', { name: 'Delete' }).click();
        await expect(page.getByText('Item deleted')).toBeVisible();

        await page.close({ runBeforeUnload: true });

        const freshPage = await context.newPage();
        await expect(async () => {
            await freshPage.goto('/products');
            await expect(freshPage.getByText('Nothing saved yet')).toBeVisible({ timeout: 1000 });
        }).toPass({ timeout: 4000 });
    });

    test('category names are trimmed, inner spaces collapsed, and duplicates are found ignoring case, including system ones', async ({ page }) => {
        await page.getByRole('button', { name: 'add product' }).click();
        const dialog = page.getByRole('dialog', { name: 'New product' });
        const categoryView = page.getByRole('dialog', { name: 'New category' });
        const addCategory = async (name: string) => {
            await categoryView.getByLabel('Name').fill(name);
            await categoryView.getByRole('button', { name: 'Add', exact: true }).click();
        };
        await dialog.getByRole('button', { name: 'New category' }).click();

        await addCategory(' books ');
        await expect(categoryView.getByText('This category already exists.')).toBeVisible();

        await addCategory('  Garden  ');
        await expect(categoryView).toBeHidden();
        await expect(dialog.getByRole('button', { name: 'garden', exact: true })).toBeVisible();

        await dialog.getByRole('button', { name: 'New category' }).click();
        await addCategory('GARDEN');
        await expect(categoryView.getByText('This category already exists.')).toBeVisible();

        await addCategory('my   plants');
        await expect(categoryView).toBeHidden();
        await dialog.getByRole('button', { name: 'New category' }).click();
        await addCategory('My Plants');
        await expect(categoryView.getByText('This category already exists.')).toBeVisible();
    });

    test('a new account sees the empty state, and an empty filter names its category', async ({ page }) => {
        await expect(page.getByText('Nothing saved yet')).toBeVisible();

        await page.getByRole('button', { name: /^films/ }).click();

        await expect(page.getByText('Nothing in films yet')).toBeVisible();
    });
});
