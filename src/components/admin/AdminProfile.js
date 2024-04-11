import React, {useEffect, useState} from 'react';
import {useNavigate} from "react-router-dom";
import Cookies from "js-cookie";
import {
    Box,
    Container,
    Typography,
    CssBaseline,
    AppBar,
    Toolbar,
    IconButton,
    Grid,
    TextField,
    Button,
    Alert,
    Menu,
    MenuItem,
} from '@mui/material';
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import {getUser, updateUser} from "../user/Requests";
import {changePassword, logout} from "../authorization/Requests";
import {validateEmpty, validatePassword} from "../authorization/Validation";

export default function AdminProfilePage() {
    const [user, setUser] = useState(JSON.parse(Cookies.get('user') || '{}'));
    const [companyName, setCompanyName] = useState('');
    const [selectedMenu, setSelectedMenu] = useState(null);
    const [oldPasswordError, setOldPasswordError] = useState('');
    const [newPasswordError, setNewPasswordError] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout(navigate);
    };

    const handleChangeUserInfo = async (event) => {
        event.preventDefault();
        await updateUser(user.id, '', companyName, setUser, setError, setSuccess);
    };

    const handlePasswordChange = async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const oldPassword = data.get('oldPassword');
        const newPassword = data.get('newPassword');

        const oldPasswordValidation = validateEmpty(oldPassword, 'Требуется ввести пароль');
        const newPasswordValidation = validatePassword(newPassword);
        setOldPasswordError(oldPasswordValidation.error);
        setNewPasswordError(newPasswordValidation.error);

        if (!oldPasswordValidation.isValid || !newPasswordValidation.isValid) {
            return;
        }

        await changePassword(oldPassword, newPassword, setError, setSuccess);
    };

    const handleMenuSelect = (event) => {
        setSelectedMenu(event.currentTarget);
    };

    const handleMenuClose = () => {
        setSelectedMenu(null);
    };

    useEffect(() => {
        if (user) {
            setCompanyName(user.company_name);
        } else {
            const fetchedUser = getUser(setError);
            setUser(fetchedUser);
            setCompanyName(fetchedUser.company_name);
        }
    }, [user]);

    return (
        <Box sx={{flexGrow: 1, overflowY: 'auto', scrollbarWidth: 'thin'}}>
            <Container component="main" maxWidth="xs">
                <CssBaseline/>
                <Box sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}>
                    <AppBar position="static">
                        <Toolbar>
                            <Typography component="h1" variant="h5" sx={{flexGrow: 1, textAlign: 'center'}}>
                                Profile
                            </Typography>
                            <IconButton color="inherit" onClick={handleMenuSelect}>
                                <MenuIcon/>
                            </IconButton>
                            <Menu
                                anchorEl={selectedMenu}
                                open={Boolean(selectedMenu)}
                                onClose={handleMenuClose}
                            >
                                <MenuItem onClick={() => navigate("/admin")}>Профиль</MenuItem>
                                <MenuItem onClick={() => navigate("/admin/services")}>Сервисы</MenuItem>
                                <MenuItem onClick={() => navigate("/admin/providers")}>Исполнители</MenuItem>
                                <MenuItem onClick={() => navigate("/admin/bookings")}>Бронирования</MenuItem>
                                <MenuItem color="inherit" onClick={handleLogout}> <LogoutIcon/> </MenuItem>
                            </Menu>
                        </Toolbar>
                    </AppBar>
                    <Box component="form" onSubmit={handleChangeUserInfo} noValidate sx={{mt: 1}}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    margin="normal"
                                    fullWidth
                                    id="companyName"
                                    label="Название компании"
                                    name="companyName"
                                    value={companyName}
                                    onChange={(event) => setCompanyName(event.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    margin="normal"
                                    fullWidth
                                    id="email"
                                    label="Email"
                                    name="email"
                                    value={user ? user.email : ''}
                                    disabled
                                />
                            </Grid>
                        </Grid>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{mt: 3, mb: 2}}
                        >
                            Сохранить изменения
                        </Button>
                    </Box>
                    <Box component="form" onSubmit={handlePasswordChange} noValidate sx={{mt: 1}}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    margin="normal"
                                    fullWidth
                                    required
                                    id="oldPassword"
                                    label="Старый пароль"
                                    name="oldPassword"
                                    type="password"
                                    autoComplete="current-password"
                                    helperText={oldPasswordError}
                                    error={!!oldPasswordError}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    margin="normal"
                                    fullWidth
                                    required
                                    id="newPassword"
                                    label="Новый пароль"
                                    name="newPassword"
                                    type="password"
                                    autoComplete="new-password"
                                    helperText={newPasswordError}
                                    error={!!newPasswordError}
                                />
                            </Grid>
                        </Grid>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{mt: 3, mb: 2}}
                        >
                            Сменить пароль
                        </Button>
                    </Box>
                    {error && (
                        <Alert severity="error" sx={{mt: 5, width: '100%', textAlign: 'center'}}>{error}</Alert>
                    )}
                    {success && (
                        <Alert severity="success" sx={{mt: 5, width: '100%', textAlign: 'center'}}>{success}</Alert>
                    )}
                </Box>
            </Container>
        </Box>
    );
}
