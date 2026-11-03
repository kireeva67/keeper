import { alpha, darken, decomposeColor, type Theme } from "@mui/material/styles";

export class CategoryChipColors {
    static readonly tintOpacity = 0.25;
    static readonly minTextContrast = 4.5;
    static readonly darkenStep = 0.05;

    static readableText(color: string, pageBackground: string): string {
        const chipBackground = CategoryChipColors.tintOver(pageBackground, color);
        for (let amount = 0; amount < 1; amount += CategoryChipColors.darkenStep) {
            const text = darken(color, amount);
            if (CategoryChipColors.contrast(text, chipBackground) >= CategoryChipColors.minTextContrast) return text;
        }
        return darken(color, 1);
    }

    private static contrast(foreground: string, background: string): number {
        const [lighter, darker] = [foreground, background].map(CategoryChipColors.luminance).sort((a, b) => b - a);
        return (lighter + 0.05) / (darker + 0.05);
    }

    private static luminance(color: string): number {
        const [r, g, b] = decomposeColor(color).values.slice(0, 3)
            .map(channel => channel / 255)
            .map(channel => channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    private static tintOver(pageBackground: string, color: string): string {
        const page = decomposeColor(pageBackground).values;
        const tint = decomposeColor(color).values;
        const opacity = CategoryChipColors.tintOpacity;
        const mixed = [0, 1, 2].map(i => page[i] * (1 - opacity) + tint[i] * opacity);
        return `rgb(${mixed.join(', ')})`;
    }
}

export const categoryChipSx = (color: string) => ({
    bgcolor: alpha(color, CategoryChipColors.tintOpacity),
    color: (theme: Theme) => CategoryChipColors.readableText(color, theme.palette.background.default),
    border: `1px solid ${color}`,
});
