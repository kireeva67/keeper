import { test, expect } from '@playwright/test';
import { KeeperApp } from './KeeperApp';

test.describe('full-screen dialogs on a phone', () => {
    let app: KeeperApp;

    test.use({ viewport: { width: 390, height: 844 } });

    test.beforeEach(async ({ page }) => {
        app = new KeeperApp(page);
        await app.signUp();
    });

    test('actions sit in the top bar, and the category step goes back to the product form', async ({ page }) => {
        await page.getByRole('button', { name: 'add product' }).click();
        const dialog = page.getByRole('dialog', { name: 'New product' });
        await dialog.getByLabel('Title').fill('Phone item');
        await dialog.getByLabel('URL').fill('https://shop.example.invalid/phone-item');

        await dialog.getByRole('button', { name: 'New category' }).click();
        const categoryView = page.getByRole('dialog', { name: 'New category' });
        await categoryView.getByRole('button', { name: 'Back' }).click();
        await expect(page.getByRole('dialog', { name: 'New product' }).getByLabel('Title')).toHaveValue('Phone item');

        const createBox = await dialog.getByRole('button', { name: 'Create' }).boundingBox();
        const titleBox = await dialog.getByLabel('Title').boundingBox();
        expect(createBox!.y).toBeLessThan(titleBox!.y);

        await dialog.getByRole('button', { name: 'Create' }).click();
        await expect(dialog).toBeHidden();
        await expect(app.card('Phone item')).toBeVisible();
    });

    test('the close button leaves the edit dialog without saving', async ({ page }) => {
        await app.addProduct('Keep me', 'keep-me');
        await app.card('Keep me').getByRole('button', { name: 'more options' }).click();
        await page.getByRole('menuitem', { name: 'Edit' }).click();
        const edit = page.getByRole('dialog', { name: 'Edit Product' });
        await edit.getByLabel('Title').fill('Changed');

        await edit.getByRole('button', { name: 'Cancel' }).click();

        await expect(edit).toBeHidden();
        await expect(app.card('Keep me')).toBeVisible();
    });
});
