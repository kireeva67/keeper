import { test, expect } from '@playwright/test';

test('the page title, manifest and every icon it lists load', async ({ page, request }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle('Keeper');

    const manifestHref = await page.locator('link[rel="manifest"]').getAttribute('href');
    const manifest = await (await request.get(manifestHref!)).json();
    expect(manifest.name).toBe('Keeper');

    const linkedIcons = await page.locator('link[rel="icon"], link[rel="apple-touch-icon"]').evaluateAll(
        links => links.map(link => link.getAttribute('href')!),
    );
    const manifestIcons = manifest.icons.map((icon: { src: string }) => icon.src);
    for (const src of [...linkedIcons, ...manifestIcons]) {
        const response = await request.get(src);
        expect(response.ok(), src).toBe(true);
        expect(response.headers()['content-type'], src).toMatch(/^image\//);
    }
});
