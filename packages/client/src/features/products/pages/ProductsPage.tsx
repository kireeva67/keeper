import { AppBar, Avatar, Fab, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Toolbar, Typography } from '@mui/material';
import AddIcon from "@mui/icons-material/Add";
import { useLocation, useNavigate } from 'react-router-dom';
import { PRODUCTS_NEW_ROUTE } from '../../auth/config/authURLS';
import { ProductList } from '../list/ProductsList';
import { useProducts } from '../api/useProducts';

import SettingsIcon from "@mui/icons-material/Settings";
import LogOutIcon from "@mui/icons-material/LogOut";
import { useState } from 'react';
import { useUser } from '../api/useUser';
import { useAuth } from '../../auth/api/useAuth';

export default function ProductsPage() {
    const { total } = useProducts();
    const { email } = useUser();
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const menuOpen = Boolean(anchorEl);
    const openMenu = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
    const closeMenu = () => setAnchorEl(null);

    return (
        <>
            <AppBar position="fixed" color="default" elevation={1}>
                <Toolbar>
                    <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                        Number of products: {total}
                    </Typography>

                    <>
                        <IconButton onClick={openMenu} sx={{ p: 0 }}>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>{email[0]?.toUpperCase()}</Avatar>
                        </IconButton>

                        <Menu anchorEl={anchorEl} open={menuOpen} onClose={closeMenu}>
                            <MenuItem >
                                <ListItemIcon>
                                    <SettingsIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText>Settings</ListItemText>
                            </MenuItem>

                            <MenuItem onClick={logout}>
                                <ListItemIcon>
                                    <LogOutIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText>Logout</ListItemText>
                            </MenuItem>
                        </Menu>
                    </>
                </Toolbar>
            </AppBar>

            <ProductList />

            <Fab
                color="primary"
                aria-label="add product"
                onClick={() => navigate(PRODUCTS_NEW_ROUTE, { state: { background: location } })}
                sx={{
                    position: "fixed",
                    right: 24,
                    bottom: 24
                }}
            >
                <AddIcon />
            </Fab>
        </>
    );
}