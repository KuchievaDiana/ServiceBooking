import React, {useState} from 'react';
import {Link as RouterLink, useNavigate} from 'react-router-dom';
import {
    Avatar,
    Button,
    TextField,
    Box,
    Container,
    Grid,
    Typography,
    CssBaseline,
    Link,
    Alert
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import {validateEmail, validatePassword} from "./Validation";
import {register} from "./Requests";
import {CUSTOMER_USER_TYPE} from "../user/Constants";

export default function RegisterCustomerPage() {
    const navigate = useNavigate();

    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [error, setError] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();

        const data = new FormData(event.currentTarget);
        const firstName = data.get('firstName')
        const lastName = data.get('lastName')
        const email = data.get('email');
        const password = data.get('password');

        const emailValidation = validateEmail(email)
        const passwordValidation = validatePassword(password);
        setEmailError(emailValidation.error);
        setPasswordError(passwordValidation.error);

        if (emailValidation.isValid && passwordValidation.isValid) {
            await register(email, password, firstName, lastName, '', CUSTOMER_USER_TYPE, navigate, setError);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline/>
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Avatar sx={{m: 1, bgcolor: 'secondary.main'}}>
                    <LockOutlinedIcon/>
                </Avatar>
                <Typography component="h1" variant="h5">
                    Регистрация
                </Typography>
                <Box component="form" noValidate onSubmit={handleSubmit} sx={{mt: 3}}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                margin="normal"
                                fullWidth
                                id="firstName"
                                label="Имя"
                                name="firstName"
                                autoComplete="given-name"
                                autoFocus
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                margin="normal"
                                fullWidth
                                id="lastName"
                                label="Фамилия"
                                name="lastName"
                                autoComplete="family-name"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Email"
                                name="email"
                                autoComplete="email"
                                autoFocus
                                helperText={emailError}
                                error={!!emailError}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="password"
                                name="password"
                                label="Пароль"
                                type="password"
                                autoComplete="new-password"
                                helperText={passwordError}
                                error={!!passwordError}
                            />
                        </Grid>
                    </Grid>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{mt: 3, mb: 2}}
                    >
                        Зарегистрироваться
                    </Button>
                </Box>
                <Grid container justifyContent="center" alignItems="center">
                    <Grid item>
                        <Button
                            component={RouterLink} to="/register/admin"
                            fullWidth
                            variant="outlined"
                            sx={{mt: 5, mb: 2}}
                        >
                            Зарегистрироваться как администратор
                        </Button>
                    </Grid>
                    <Grid item>
                        <Link component={RouterLink} to="/login">
                            У вас уже есть учетная запись? Войти
                        </Link>
                    </Grid>
                </Grid>
            </Box>
            {error && (
                <Alert severity="error" sx={{mt: 5, width: '100%', textAlign: 'center'}}>{error}</Alert>
            )}
        </Container>
    );
}