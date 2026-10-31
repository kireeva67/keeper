import { expect, type Locator, type Page } from '@playwright/test';

// Page object for the flows the e2e tests share. Every test signs up its own
// fresh account, so tests never depend on each other or on existing data.
export class KeeperApp {
    readonly password = 'E2e-pass-123!';
    // `.invalid` never resolves, so the server's preview fetch fails fast and the
    // product is saved without an image. No real site is contacted.
    readonly productHost = 'https://shop.example.invalid';

    constructor(readonly page: Page) {}

    uniqueEmail(): string {
        return `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.invalid`;
    }

    productUrl(slug: string): string {
        return `${this.productHost}/${slug}`;
    }

    async signUp(email = this.uniqueEmail()): Promise<string> {
        await this.page.goto('/signup');
        await this.page.getByLabel('Email').fill(email);
        await this.page.getByLabel('Password', { exact: true }).fill(this.password);
        await this.page.getByRole('button', { name: 'Create account' }).click();
        await expect(this.page).toHaveURL(/\/products$/);
        return email;
    }

    async logIn(email: string, password = this.password): Promise<void> {
        await this.page.goto('/login');
        await this.page.getByLabel('Email').fill(email);
        await this.page.getByLabel('Password', { exact: true }).fill(password);
        await this.page.getByRole('button', { name: 'Sign in', exact: true }).click();
    }

    async openUserMenu(): Promise<void> {
        // The app bar menu button has no aria-label, so find it by its MUI icon.
        await this.page.locator('header button:has(svg[data-testid="MoreVertIcon"])').click();
    }

    async logOut(): Promise<void> {
        await this.openUserMenu();
        await this.page.getByRole('menuitem', { name: 'Log out' }).click();
        await expect(this.page).toHaveURL(/\/login$/);
    }

    async openSettings(): Promise<void> {
        await this.openUserMenu();
        await this.page.getByRole('menuitem', { name: 'Settings' }).click();
        await expect(this.page.getByRole('heading', { name: 'Settings' })).toBeVisible();
    }

    // Adds a product through the new product dialog. `category` picks an existing one
    // (as shown in the picker, lowercase); `newCategory` creates a custom one first,
    // which selects it. With neither, the default category is kept.
    async addProduct(title: string, slug: string, options: { category?: string; newCategory?: string } = {}): Promise<void> {
        await this.page.getByRole('button', { name: 'add product' }).click();
        const dialog = this.page.getByRole('dialog', { name: 'New product' });
        await dialog.getByLabel('Title').fill(title);
        await dialog.getByLabel('URL').fill(this.productUrl(slug));
        if (options.category) {
            await dialog.getByRole('button', { name: options.category, exact: true }).click();
        }
        if (options.newCategory) {
            await dialog.locator('button:has(svg[data-testid="AddIcon"])').click();
            const categoryDialog = this.page.getByRole('dialog', { name: 'New category' });
            await categoryDialog.getByLabel('Name').fill(options.newCategory);
            await categoryDialog.getByRole('button', { name: 'Create' }).click();
            await expect(categoryDialog).toBeHidden();
        }
        await dialog.getByRole('button', { name: 'Create' }).click();
        await expect(dialog).toBeHidden();
    }

    card(title: string): Locator {
        return this.page.locator('.MuiCard-root').filter({ has: this.page.getByRole('heading', { name: title, exact: true }) });
    }

    cardCategory(title: string): Locator {
        return this.card(title).locator('.MuiChip-label');
    }
}
