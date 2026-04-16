import { useTheme } from "@mui/material";

type KeeperLogoProps = {
    width?: number;
    height?: number;
};

export function KeeperLogo({ width = 60, height = 60 }: KeeperLogoProps) {
    const theme = useTheme();
    const color = theme.palette.primary.main;

    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width={width} height={height}>
            <path d="M14 8 L50 8 L50 56 L32 44 L14 56 Z" fill={color} />
            <ellipse cx="24" cy="20" rx="8" ry="5" fill="white" opacity="0.12" />
            <polygon points="32,18 35,27 45,27 37,33 40,42 32,36 24,42 27,33 19,27 29,27" fill="#f9c74f" />
            <circle cx="8" cy="14" r="3" fill="#f9c74f" opacity="0.6" />
            <circle cx="5" cy="24" r="1.8" fill="#f9c74f" opacity="0.4" />
            <circle cx="56" cy="12" r="3" fill="#f9c74f" opacity="0.6" />
            <circle cx="59" cy="22" r="1.8" fill="#f9c74f" opacity="0.4" />
        </svg>
    );
}
