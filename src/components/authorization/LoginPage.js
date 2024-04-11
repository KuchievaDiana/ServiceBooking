import React, {useState} from 'react';
import {Link as RouterLink,  useNavigate } from 'react-router-dom';
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
import {validateEmpty} from "./Validation"
import {login} from "./Requests";

export default function LoginPage() {
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();

        const data = new FormData(event.currentTarget);
        const email = data.get('email');
        const password = data.get('password');

        const emailValidation = validateEmpty(email, 'Требуется ввести email')
        const passwordValidation = validateEmpty(password, 'Требуется ввести пароль');
        setEmailError(emailValidation.error);
        setPasswordError(passwordValidation.error);

        if (!emailValidation.isValid || !passwordValidation.isValid) {
            return;
        }

        await login(email, password, navigate, setError)
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
                    Вход в аккаунт
                </Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{mt: 1}}>
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
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="password"
                        name="password"
                        label="Пароль"
                        type="password"
                        autoComplete="current-password"
                        helperText={passwordError}
                        error={!!passwordError}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{mt: 3, mb: 2}}
                    >
                        Войти
                    </Button>
                </Box>
                <Grid container justifyContent="center" alignItems="center">
                    <Grid item>
                        <Link component={RouterLink} to="/register">
                            {"Ещё нет аккаунта? Зарегистрироваться"}
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