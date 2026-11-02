import { test, expect } from '@playwright/test';
import { KeeperApp } from './KeeperApp';

// Field length limits (title 120, description 500, category name 24), checked at
// phone width, where long text is most likely to break the layout.
test.describe('field limits', () => {
    let app: KeeperApp;

    test.use({ viewport: { width: 390, height: 844 } });

    test.beforeEach(async ({ page }) => {
        app = new KeeperApp(page);
        await app.signUp();
    });

    test('long title, description and category name are capped and fit on the card', async ({ page }) => {
        const title = 'Long title '.repeat(11).trim().slice(0, 120);
        await page.getByRole('button', { name: 'add product' }).click();
        const dialog = page.getByRole('dialog', { name: 'New product' });
        await dialog.getByLabel('Title').fill(title + ' and more');
        await expect(dialog.getByLabel('Title')).toHaveValue(title);
        await expect(dialog.getByText('120/120')).toBeVisible();
        await dialog.getByLabel('Description').fill('A long description. '.repeat(30));
        await expect(dialog.getByText('500/500')).toBeVisible();
        await dialog.getByLabel('URL').fill(app.productUrl('long-fields'));

        await dialog.getByRole('button', { name: 'New category' }).click();
        const categoryView = page.getByRole('dialog', { name: 'New category' });
        await categoryView.getByLabel('Name').fill('Kitchen and dining stuff and more');
        await expect(categoryView.getByLabel('Name')).toHaveValue('Kitchen and dining stuff');
        await categoryView.getByRole('button', { name: 'Add', exact: true }).click();
        await expect(categoryView).toBeHidden();
        await dialog.getByRole('button', { name: 'Create' }).click();
        await expect(dialog).toBeHidden();

        await expect(app.cardCategory(title)).toHaveText('kitchen and dining stuff');
        // The title stays on one line and is cut with an ellipsis.
        const heading = app.card(title).getByRole('heading', { name: title, exact: true });
        await expect(heading).toHaveCSS('text-overflow', 'ellipsis');
        await expect(heading).toHaveCSS('white-space', 'nowrap');
        // The description is clamped to 3 lines.
        await expect(app.card(title).locator('p.MuiTypography-body2')).toHaveCSS('-webkit-line-clamp', '3');
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow).toBe(0);
    });

    test('a title of only spaces shows an error when creating and editing', async ({ page }) => {
        await page.getByRole('button', { name: 'add product' }).click();
        const create = page.getByRole('dialog', { name: 'New product' });
        await create.getByLabel('Title').fill('   ');
        await create.getByLabel('URL').fill(app.productUrl('blank-title'));
        await create.getByRole('button', { name: 'Create' }).click();
        await expect(create.getByText('Title is required')).toBeVisible();
        await create.getByRole('button', { name: 'Cancel' }).click();
        await expect(create).toBeHidden();

        await app.addProduct('Keep me', 'keep-me');
        await app.card('Keep me').getByRole('button', { name: 'more options' }).click();
        await page.getByRole('menuitem', { name: 'Edit' }).click();
        const edit = page.getByRole('dialog', { name: 'Edit Product' });
        await edit.getByLabel('Title').fill('   ');
        await edit.getByRole('button', { name: 'Save Changes' }).click();
        await expect(edit.getByText('Title is required')).toBeVisible();
        await edit.getByLabel('Title').fill('Kept');
        await expect(edit.getByText('Title is required')).toBeHidden();
        await edit.getByRole('button', { name: 'Cancel' }).click();

        await page.reload();
        await expect(app.card('Keep me')).toBeVisible();
    });

    test('an empty form shows required errors under the fields, not browser bubbles', async ({ page }) => {
        await page.getByRole('button', { name: 'add product' }).click();
        const dialog = page.getByRole('dialog', { name: 'New product' });
        await dialog.getByRole('button', { name: 'Create' }).click();

        await expect(dialog.getByText('Title is required')).toBeVisible();
        await expect(dialog.getByText('URL is required')).toBeVisible();
        // The browser's own validation would leave the input marked invalid; noValidate skips it.
        expect(await dialog.getByLabel('Title').evaluate(el => (el.closest('form') as HTMLFormElement).noValidate)).toBe(true);

        await dialog.getByLabel('URL').fill(app.productUrl('now-valid'));
        await expect(dialog.getByText('URL is required')).toBeHidden();
    });

    test('the API rejects over-limit fields sent past the form', async ({ page }) => {
        // page.request shares the signed-in session cookie with the page.
        const api = 'http://localhost:3201/api';
        const product = await page.request.post(`${api}/products`, {
            data: { title: 'a'.repeat(121), url: app.productUrl('too-long') },
        });
        expect(product.status()).toBe(400);
        expect(await product.json()).toEqual({ message: 'Title must be at most 120 characters.' });

        const category = await page.request.post(`${api}/categories`, {
            data: { name: 'c'.repeat(25), color: '#c62828' },
        });
        expect(category.status()).toBe(400);
        expect(await category.json()).toEqual({ message: 'Category name must be at most 24 characters.' });
    });
});
