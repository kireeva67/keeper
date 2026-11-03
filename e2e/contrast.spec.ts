import { test, expect, type Locator, type Page } from '@playwright/test';
import { KeeperApp } from './KeeperApp';

// Measures the rendered text contrast of category chips (WCAG AA needs 4.5:1).
// Semi-transparent chip tints are composited over their ancestors' backgrounds.
test.describe('category chip contrast', () => {
    const minContrast = 4.5;
    const api = 'http://localhost:3201/api';
    // Weakest colors measured before the fix; the API allows only 10 new products a minute.
    const cardColors = ['yellow', 'orange', 'light green', 'light blue', 'green', 'red', 'presents'];
    let app: KeeperApp;

    test.beforeEach(async ({ page }) => {
        app = new KeeperApp(page);
        await app.signUp();
        await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; }' });
        await addCategoryForEverySwatch(page);
    });

    test('selected filter chips', async ({ page }) => {
        const categoryChips = page.locator('header button[aria-pressed]').filter({ hasNotText: /^all/ });
        for (const chip of await categoryChips.all()) await chip.click();
        await page.mouse.move(0, 0);

        await expectReadable(page.locator('header button[aria-pressed="true"]'), 'selected filter');
    });

    test('card chips', async ({ page }) => {
        const categories: { id: number; name: string }[] = await (await page.request.get(`${api}/categories`)).json();
        for (const name of cardColors) {
            const category = categories.find(c => c.name.toLowerCase() === name)!;
            const response = await page.request.post(`${api}/products`, {
                data: { title: `Item ${name}`, url: app.productUrl(name.replace(' ', '-')), categoryId: category.id },
            });
            expect(response.ok()).toBe(true);
        }
        await page.reload();

        await expectReadable(page.locator('.MuiCard-root .MuiChip-label'), 'card', cardColors.length);
    });

    test('settings tags', async ({ page }) => {
        await app.openSettings();

        await expectReadable(page.getByText('My categories').locator('xpath=following-sibling::*[1]/*'), 'settings');
    });

    test('the "all" chip, selected and unselected', async ({ page }) => {
        const allChip = page.locator('header button[aria-pressed]').filter({ hasText: /^all/ });
        await expectReadable(allChip, 'selected all', 1);

        await page.getByRole('button', { name: /^books/ }).click();
        await page.mouse.move(0, 0);
        await expect(allChip).toHaveAttribute('aria-pressed', 'false');
        await expectReadable(allChip, 'unselected all', 1);
    });

    test('unselected filter and picker chips', async ({ page }) => {
        await expectReadable(page.locator('header button[aria-pressed="false"]'), 'unselected filter');

        await page.getByRole('button', { name: 'add product' }).click();
        const unselectedPickerChips = page.getByRole('dialog', { name: 'New product' }).locator('button[aria-pressed="false"]');
        await expectReadable(unselectedPickerChips, 'unselected picker');
    });

    async function addCategoryForEverySwatch(page: Page) {
        await page.getByRole('button', { name: 'add product' }).click();
        const productDialog = page.getByRole('dialog', { name: 'New product' });
        await productDialog.getByRole('button', { name: 'New category' }).click();
        const swatchNames = await page.getByRole('group', { name: 'Color' }).getByRole('button').evaluateAll(
            buttons => buttons.map(b => b.getAttribute('aria-label')!),
        );
        await page.getByRole('dialog', { name: 'New category' }).getByRole('button', { name: 'Cancel' }).click();

        for (const swatch of swatchNames) {
            await productDialog.getByRole('button', { name: 'New category' }).click();
            const categoryView = page.getByRole('dialog', { name: 'New category' });
            await categoryView.getByLabel('Name').fill(swatch);
            await categoryView.getByRole('group', { name: 'Color' }).getByRole('button', { name: swatch, exact: true }).click();
            await categoryView.getByRole('button', { name: 'Add', exact: true }).click();
            await expect(categoryView).toBeHidden();
        }
        await productDialog.getByRole('button', { name: 'Cancel' }).click();
        await expect(productDialog).toBeHidden();
    }

    async function expectReadable(chips: Locator, where: string, expectedCount?: number) {
        if (expectedCount !== undefined) await expect(chips).toHaveCount(expectedCount);
        await chips.first().waitFor();
        const results = await chips.evaluateAll(elements => elements.map(element => {
            const parse = (color: string) => (color.match(/[\d.]+/g) ?? []).map(Number);
            const layers: number[][] = [];
            for (let node: Element | null = element; node; node = node.parentElement) {
                const [r, g, b, a = 1] = parse(getComputedStyle(node).backgroundColor);
                if (a > 0) layers.push([r, g, b, a]);
                if (a === 1) break;
            }
            let background = [255, 255, 255];
            for (const [r, g, b, a] of layers.reverse()) {
                background = [r, g, b].map((v, i) => v * a + background[i] * (1 - a));
            }
            const [tr, tg, tb, ta = 1] = parse(getComputedStyle(element).color);
            const text = [tr, tg, tb].map((v, i) => v * ta + background[i] * (1 - ta));
            const luminance = (rgb: number[]) => {
                const [r, g, b] = rgb.map(v => v / 255).map(v => v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
                return 0.2126 * r + 0.7152 * g + 0.0722 * b;
            };
            const [lighter, darker] = [luminance(text), luminance(background)].sort((x, y) => y - x);
            return { name: element.textContent!.trim(), ratio: (lighter + 0.05) / (darker + 0.05) };
        }));

        console.log(`\n${where} chips:\n` + results.map(r => `  ${r.name.padEnd(20)} ${r.ratio.toFixed(2)}`).join('\n'));
        expect(results.length).toBeGreaterThan(0);
        const failing = results.filter(r => r.ratio < minContrast).map(r => `${r.name} ${r.ratio.toFixed(2)}`);
        expect(failing, `${where} chips below ${minContrast}:1`).toEqual([]);
    }
});
