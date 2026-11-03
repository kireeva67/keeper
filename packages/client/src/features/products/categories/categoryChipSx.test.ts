import { decomposeColor, rgbToHex } from "@mui/material/styles";
import { CategoryChipColors } from "./categoryChipSx";

const pageBackground = '#f5f5f5';
const presetColors = ['#c62828', '#ad1457', '#6a1b9a', '#1565c0', '#00695c', '#2e7d32', '#e65100', '#f57f17', '#4e342e', '#0277bd', '#558b2f', '#37474f'];
const systemColors = ['#0d47a1', '#880e4f', '#4a148c', '#1b5e20', '#311b92', '#bf360c', '#006064', '#9e9e9e'];
const channelSteps = [0, 51, 102, 153, 204, 255];
const colorGrid = channelSteps.flatMap(r => channelSteps.flatMap(g => channelSteps.map(b => rgbToHex(`rgb(${r}, ${g}, ${b})`))));

function tintOver(base: string, color: string, opacity: number) {
    const channel = (hex: string, i: number) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);
    const mixed = [0, 1, 2].map(i => channel(base, i) * (1 - opacity) + channel(color, i) * opacity);
    return `rgb(${mixed.join(', ')})`;
}

function exactContrast(foreground: string, background: string) {
    const luminance = (color: string) => {
        const [r, g, b] = decomposeColor(color).values.slice(0, 3)
            .map(v => v / 255)
            .map(v => v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const [lighter, darker] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
    return (lighter + 0.05) / (darker + 0.05);
}

describe('CategoryChipColors.readableText', () => {
    it.each([...presetColors, ...systemColors, ...colorGrid])('%s reaches 4.5:1 on the chip and the card', (color) => {
        const text = CategoryChipColors.readableText(color, pageBackground);
        expect(exactContrast(text, tintOver(pageBackground, color, 0.25))).toBeGreaterThanOrEqual(4.5);
        expect(exactContrast(text, tintOver('#ffffff', color, 0.12))).toBeGreaterThanOrEqual(4.5);
    });

    it('keeps a color that is already readable', () => {
        expect(CategoryChipColors.readableText('#4e342e', pageBackground)).toBe('rgb(78, 52, 46)');
    });
});
