import { alpha, darken, decomposeColor, getContrastRatio, recomposeColor, type Theme } from "@mui/material/styles";

export class CategoryChipColors {
    static readonly tintOpacity = 0.25;
    static readonly minTextContrast = 4.5;
    static readonly darkenStep = 0.05;

    static readableText(color: string, pageBackground: string): string {
        const chipBackground = CategoryChipColors.tintOver(pageBackground, color);
        for (let amount = 0; amount < 1; amount += CategoryChipColors.darkenStep) {
            const text = darken(color, amount);
            if (getContrastRatio(text, chipBackground) >= CategoryChipColors.minTextContrast) return text;
        }
        return darken(color, 1);
    }

    private static tintOver(pageBackground: string, color: string): string {
        const page = decomposeColor(pageBackground).values;
        const tint = decomposeColor(color).values;
        const opacity = CategoryChipColors.tintOpacity;
        const mixed = [0, 1, 2].map(i => Math.round(page[i] * (1 - opacity) + tint[i] * opacity));
        return recomposeColor({ type: 'rgb', values: mixed as [number, number, number] });
    }
}

export const categoryChipSx = (color: string) => ({
    bgcolor: alpha(color, CategoryChipColors.tintOpacity),
    color: (theme: Theme) => CategoryChipColors.readableText(color, theme.palette.background.default),
    border: `1px solid ${color}`,
});
