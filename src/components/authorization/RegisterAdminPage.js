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
import {validateEmail, validateEmpty, validatePassword} from "./Validation";
import {register} from "./Requests";
import {ADMIN_USER_TYPE} from "../user/Constants";

export default function RegisterAdminPage() {
    const navigate = useNavigate();

    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [companyNameError, setCompanyNameError] = useState('');
    const [error, setError] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();

        const data = new FormData(event.currentTarget);
        const email = data.get('email');
        const password = data.get('password');
        const companyName = data.get('companyName')

        const emailValidation = validateEmail(email)
        const passwordValidation = validatePassword(password);
        const companyNameValidation = validateEmpty(companyName, 'Требуется ввести название компании')
        setEmailError(emailValidation.error);
        setPasswordError(passwordValidation.error);
        setCompanyNameError(companyNameValidation.error);

        if (emailValidation.isValid && passwordValidation.isValid) {
            await register(email, password, '', '', companyName, ADMIN_USER_TYPE, navigate, setError);
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
                        <Grid item xs={12}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="companyName"
                                label="Название компании"
                                name="companyName"
                                autoFocus
                                helperText={companyNameError}
                                error={!!companyNameError}
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
                <Button
                    component={RouterLink} to="/register"
                    type=""
                    fullWidth
                    variant="outlined"
                    sx={{mt: 3, mb: 2}}
                >
                    Зарегистрироваться как пользователь
                </Button>
                <Grid container justifyContent="center">
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