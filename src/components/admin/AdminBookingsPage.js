import React, {useEffect, useState} from 'react';
import {useNavigate} from "react-router-dom";
import Cookies from "js-cookie";
import {
    Box,
    Typography,
    CssBaseline,
    AppBar,
    Toolbar,
    IconButton,
    Button,
    Alert,
    Card,
    CardActions,
    CardContent,
    Menu,
    MenuItem,
    Container,
} from '@mui/material';
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from '@mui/icons-material/Menu';

import {getUser} from "../user/Requests";
import {getBookings, deleteBooking} from "./Requests";

export default function AdminBookingsPage() {
    const [user, setUser] = useState(JSON.parse(Cookies.get('user') || '{}'));
    const [bookings, setBookings] = useState([]);
    const [selectedMenu, setSelectedMenu] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();

    function formatDate(input) {
        // Parse input string into a Date object
        const dateTime = new Date(input);

        // Format date to YYYY/MM/DD and time to HH:MM
        const formattedDateTime = dateTime.toLocaleString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });

        return formattedDateTime;
    }


    useEffect(() => {
        const fetchData = async () => {
            if (user == null) {
                const fetchedUser = await getUser(setError);
                setUser(fetchedUser);
            }
            setBookings(await getBookings(setError))
        };

        fetchData();
    }, [user]);

    const handleMenuSelect = (event) => {
        setSelectedMenu(event.currentTarget);
    };

    const handleMenuClose = () => {
        setSelectedMenu(null);
    };

    const handleLogout = () => {
        Cookies.remove('token');
        navigate("/login");
    };

    const deleteExistingBooking = async (bookingId) => {
        await deleteBooking(bookingId, setError, setSuccess);
    };

    return (
        <Container maxWidth="sm" style={{maxHeight: 'calc(100vh - 64px)', overflowY: 'auto'}}>
            <CssBaseline/>
            <AppBar position="static">
                <Toolbar>
                    <Typography component="h1" variant="h5" sx={{flexGrow: 1, textAlign: 'center'}}>
                        Бронирования
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
                        <MenuItem onClick={handleLogout}>
                            <LogoutIcon/>
                            Выйти
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

            <Box sx={{
                marginTop: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '0 20px',
            }}>
                {bookings.map(booking =>
                    <Card key={booking.id} sx={{marginBottom: '20px', width: '100%'}}>
                        <CardContent>
                            <Typography variant="h5" component="div">
                                {booking.service.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {booking.service_provider.first_name + " " + booking.service_provider.last_name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {booking.customer.first_name + " " + booking.customer.last_name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Начало - {formatDate(booking.start_time)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Конец - {formatDate(booking.end_time)}
                            </Typography>
                            {!booking.is_active && <Typography variant="body2" color="error">Отменено</Typography>}
                            <Typography variant="body2">{booking.comment} {booking.rating}</Typography>
                        </CardContent>
                        <CardActions sx={{justifyContent: 'space-between'}}>
                            <Button size="small" onClick={() => deleteExistingBooking(booking.id)}>Delete</Button>
                        </CardActions>
                    </Card>
                )}

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