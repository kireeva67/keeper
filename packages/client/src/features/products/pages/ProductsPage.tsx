import { AppBar, Box, Fab, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Toolbar } from '@mui/material';
import AddIcon from "@mui/icons-material/Add";
import { useLocation, useNavigate } from 'react-router-dom';
import { PRODUCTS_NEW_ROUTE, SETTINGS_ROUTE } from '../../auth/config/authURLS';
import { ProductList } from '../list/ProductsList';
import { useProducts } from '../api/useProducts';

import SettingsIcon from "@mui/icons-material/Settings";
import LogOutIcon from "@mui/icons-material/Logout";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useState } from 'react';
import { useAuth } from '../../auth/api/useAuth';
import { UserAvatar } from '../../../shared/components/UserAvatar';
import { useCategories } from '../api/useCategories';
import CategoryFilter from '../filter/CategoryFilter';
import { KeeperLogo } from '../../../shared/components/KeeperLogo';

export default function ProductsPage() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const menuOpen = Boolean(anchorEl);
    const openMenu = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
    const closeMenu = () => setAnchorEl(null);
    const { categories } = useCategories();
    const { setFilter, categoriesIds, total } = useProducts();

    return (
        <>
            <AppBar position="fixed" color="default" elevation={1}>
                <Toolbar>
                    <Box sx={{ py: 1, display: 'flex', alignItems: 'center' }}>
                        <KeeperLogo />
                    </Box>
                    <Box sx={{ flexGrow: 1 }} />
                    <UserAvatar />
                    <IconButton onClick={openMenu}>
                        <MoreVertIcon />
                    </IconButton>
                    <Menu anchorEl={anchorEl} open={menuOpen} onClose={closeMenu}>
                        <MenuItem onClick={() => navigate(SETTINGS_ROUTE)}>
                            <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
                            <ListItemText>Settings</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={logout}>
                            <ListItemIcon><LogOutIcon fontSize="small" /></ListItemIcon>
                            <ListItemText>Logout</ListItemText>
                        </MenuItem>
                    </Menu>
                </Toolbar>
                <Toolbar sx={{ pb: 1, mt: 1, justifyContent: 'center', px: 2 }}>
                    <CategoryFilter
                        categories={categories}
                        value={categoriesIds}
                        onChange={(id) => setFilter(id)}
                        count={total}
                    />
                </Toolbar>
            </AppBar>

            <Box sx={{ px: 2 }}>
                <Toolbar />
                <Box sx={{ height: 36 }} />
                <ProductList />
            </Box>

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