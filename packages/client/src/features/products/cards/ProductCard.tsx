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

type CardProps = {
    title: string;
    imageUrl: string;
    goTo: string;
    description: string;
};

export function ProductCard({ title, imageUrl, goTo, description }: CardProps) {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const menuOpen = Boolean(anchorEl);
    const openMenu = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
    const closeMenu = () => setAnchorEl(null);

    const handleEdit = () => {
        closeMenu();
        // onEdit(); //TODO
    };

    const handleDelete = () => {
        closeMenu();
        // onDelete(); //TODO
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
                href={goTo}
                target="_blank"
                rel="noopener noreferrer"
            >
                <CardMedia component="img" height="180" image={imageUrl} alt={title} loading="lazy" />

            </CardActionArea>
            <CardContent>
                <Typography variant="body2" color="text.secondary">
                    {description}
                </Typography>
            </CardContent>
        </Card>
    );
}