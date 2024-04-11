import React, {useState, useEffect} from 'react';
import {useNavigate, Link} from 'react-router-dom';
import Cookies from "js-cookie";
import {
    AppBar,
    Toolbar,
    IconButton,
    Button,
    TextField,
    Box,
    Container,
    Grid,
    Typography,
    CssBaseline,
    Alert
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import BookingIcon from '@mui/icons-material/CalendarToday';
import {getUser, updateUser} from "../user/Requests";
import {validateEmpty, validatePassword} from "../authorization/Validation";
import {changePassword, logout} from "../authorization/Requests";


export default function CustomerProfilePage() {
    const [user, setUser] = useState(JSON.parse(Cookies.get('user') || '{}'));
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')

    const [oldPasswordError, setOldPasswordError] = useState('');
    const [newPasswordError, setNewPasswordError] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const navigate = useNavigate();

    const handleLogout = () => {
        logout(navigate)
    };

    const handleChangeUserInfo = async (event) => {
        event.preventDefault();
        await updateUser(firstName, lastName, '', setUser, setError, setSuccess)
    }

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

    useEffect(() => {
        if (user) {
            setFirstName(user.first_name)
            setLastName(user.last_name)
        } else {
            const fetchedUser = getUser(setError);
            setUser(fetchedUser);
            setFirstName(user.first_name)
            setLastName(user.last_name)
        }
    }, [user]);

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline/>
            <Box sx={{
                marginTop: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
            >
                <AppBar position="static">
                    <Toolbar>
                        <Typography component="h1" variant="h5" sx={{flexGrow: 1, textAlign: 'center'}}>
                            Профиль
                        </Typography>
                        <IconButton color="inherit" component={Link} to="/profile/bookings">
                            <BookingIcon/>
                        </IconButton>
                        <IconButton color="inherit" onClick={handleLogout}>
                            <LogoutIcon/>
                        </IconButton>
                    </Toolbar>
                </AppBar>

                <Box component="form" onSubmit={handleChangeUserInfo} noValidate sx={{mt: 1}}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                margin="normal"
                                fullWidth
                                id="firstName"
                                label="Имя"
                                name="firstName"
                                value={firstName}
                                onChange={(event) => setFirstName(event.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                margin="normal"
                                fullWidth
                                id="lastName"
                                label="Фамилия"
                                name="lastName"
                                value={lastName}
                                onChange={(event) => setLastName(event.target.value)}
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
    );
}