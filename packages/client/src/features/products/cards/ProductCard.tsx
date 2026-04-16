import * as React from "react";
import {
    Card,
    CardMedia,
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    CardActionArea,
    Typography,
    Chip,
    Box,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { deleteProduct } from "../api/deleteProduct";
import type { Product } from "../../../shared/types/ProductType";
import { DEFAULT_PRODUCT_IMAGE } from "./DefaultImage";
import { useLocation, useNavigate } from "react-router-dom";
import { useProducts } from "../api/useProducts";
import { alpha } from "@mui/material/styles";
import { useState } from "react";

type CardProps = {
    product: Product;
};

export function ProductCard({ product }: CardProps) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const { title, imageUrl, url, description, id, category } = product;
    const menuOpen = Boolean(anchorEl);
    const openMenu = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
    const closeMenu = () => setAnchorEl(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { deleteProductFromState } = useProducts();

    const handleEdit = () => {
        closeMenu();
        navigate(`/products/edit/${id}`, { state: { background: location } });
    };

    const handleDelete = async () => {
        closeMenu();
        const success = await deleteProduct(id);
        if (success) {
            deleteProductFromState(id);
        }
    };

    return (
        <Card sx={{ width: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', px: 2, pt: 2, pb: 1, gap: 1 }}>
                <Typography variant="subtitle1" fontWeight={600} noWrap sx={{ flex: 1 }}>
                    {title}
                </Typography>
                <IconButton aria-label="more options" onClick={openMenu} size="small" sx={{ flexShrink: 0 }}>
                    <MoreVertIcon fontSize="small" />
                </IconButton>
                <Menu anchorEl={anchorEl} open={menuOpen} onClose={closeMenu}>
                    <MenuItem onClick={handleEdit}>
                        <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                        <ListItemText>Edit</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={handleDelete}>
                        <ListItemIcon><DeleteIcon fontSize="small" /></ListItemIcon>
                        <ListItemText>Delete</ListItemText>
                    </MenuItem>
                </Menu>
            </Box>

            <CardActionArea component="a" href={url} target="_blank" rel="noopener noreferrer">
                <CardMedia
                    component="img"
                    image={imageUrl ?? DEFAULT_PRODUCT_IMAGE}
                    alt={title}
                    loading="lazy"
                    sx={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover' }}
                />
            </CardActionArea>

            <Box sx={{ px: 2, pt: 1, pb: 2, display: 'flex', flexDirection: 'column' }}>
                <Chip
                    label={category.name.toLowerCase()}
                    size="small"
                    sx={{
                        backgroundColor: alpha(category.color, 0.12),
                        color: category.color,
                        fontWeight: 500,
                        border: `1px solid ${category.color}22`,
                        borderRadius: '20px',
                        width: 'fit-content',
                    }}
                />
                {description && (
                    <Typography sx={{ pl: 0.5, mt: '4px' }} variant="body2" color="text.secondary">
                        {description}
                    </Typography>
                )}
            </Box>
        </Card>
    );
}