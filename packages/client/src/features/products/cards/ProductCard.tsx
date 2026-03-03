import * as React from "react";
import {
    Card,
    CardHeader,
    CardMedia,
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    CardActionArea,
    CardContent,
    Typography
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { deleteProduct } from "../api/deleteProduct";
import type { Product } from "../../../shared/types/ProductType";
import { DEFAULT_PRODUCT_IMAGE } from "./DefaultImage";
import { useLocation, useNavigate } from "react-router-dom";
import { useProducts } from "../api/useProducts";
import { Chip } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { CATEGORY_COLORS } from "../defaults";
import { useEffect } from "react";

type CardProps = {
    product: Product;
};

export function ProductCard({ product }: CardProps) {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
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
        <Card sx={{ borderRadius: 2 }}>
            <CardHeader
                title={title}
                action={
                    <>
                        <IconButton aria-label="more options" onClick={openMenu}>
                            <MoreVertIcon />
                        </IconButton>

                        <Menu anchorEl={anchorEl} open={menuOpen} onClose={closeMenu}>
                            <MenuItem onClick={handleEdit}>
                                <ListItemIcon>
                                    <EditIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText>Edit</ListItemText>
                            </MenuItem>

                            <MenuItem onClick={handleDelete}>
                                <ListItemIcon>
                                    <DeleteIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText>Delete</ListItemText>
                            </MenuItem>
                        </Menu>
                    </>
                }
            />

            <CardActionArea component="a"
                href={url}
                target="_blank"
                rel="noopener noreferrer"
            >
                <CardMedia component="img" height="400" image={imageUrl ?? DEFAULT_PRODUCT_IMAGE} alt={title} loading="lazy" />

            </CardActionArea>
            <CardContent>
                <Chip
                    label={category.name.toLowerCase()}
                    size="small"
                    sx={{ bgcolor: alpha(CATEGORY_COLORS[category.name], 0.25), color: CATEGORY_COLORS[category.name], border: `1px solid ${CATEGORY_COLORS[category.name]}` }}
                />
                <Typography variant="body2" color="text.secondary">
                    {description}
                </Typography>
            </CardContent>
        </Card>
    );
}