import { test, expect } from '@playwright/test';
import { KeeperApp } from './KeeperApp';

// Image part of smoke check 7. It needs the internet: the server fetches the real
// page for its preview image, so a failure here can be the site, not our code.
// Skip it offline or in CI with `npx playwright test --grep-invert @network`.
test.describe('product images', { tag: '@network' }, () => {
    test('7b. product from a real page shows its preview image', async ({ page }) => {
        const app = new KeeperApp(page);
        await app.signUp();

        await app.addProduct('YouTube video', 'youtube', { url: 'https://www.youtube.com/watch?v=wmaKMfQQjYQ' });

        const image = app.cardImage('YouTube video');
        await expect(image).toHaveAttribute('src', /^https:\/\/i\.ytimg\.com\//);
        // naturalWidth is 0 until the browser has actually loaded the image.
        await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
    });
});
