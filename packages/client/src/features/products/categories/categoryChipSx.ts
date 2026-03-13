import { alpha } from "@mui/material/styles";

export const categoryChipSx = (color: string) => ({
    bgcolor: alpha(color, 0.25),
    color,
    border: `1px solid ${color}`,
});
