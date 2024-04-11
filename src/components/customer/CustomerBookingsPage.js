import React, {useEffect, useState} from 'react';
import {Link, useNavigate} from "react-router-dom";
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
    Container, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions, Dialog,
} from '@mui/material';
import LogoutIcon from "@mui/icons-material/Logout";

import {getUser} from "../user/Requests";
import {addFeedback, deleteBooking, getBookings} from "../admin/Requests";
import AccountCircle from "@mui/icons-material/AccountCircle";

export default function CustomerBookingsPage() {
    const [user, setUser] = useState(JSON.parse(Cookies.get('user') || '{}'));
    const [bookings, setBookings] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [currentBooking, setCurrentBooking] = useState({
        id: '',
        comment: '',
        rating: 1,
        // add all other fields from booking here
        service: {},
        serviceProvider: {},
        customer: {},
        startTime: '',
        endTime: '',
        isActive: '',
    })
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
    }, [user])

    const handleLogout = () => {
        Cookies.remove('token');
        navigate("/login");
    };

    const addFeedbackForBooking = async () => {
        try {
            console.log(currentBooking)
            const response = await addFeedback(
                currentBooking.id, currentBooking.comment, currentBooking.rating, setError, setSuccess
            );
            if (response) {
                setSuccess("Отзыв успешно оставлен");
                setDialogOpen(false);
            } else {
                setError("Ошибка при добавлении отзыва");
            }
        } catch (error) {
            setError("Ошибка при добавлении отзыва");
        }
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
                    <IconButton color="inherit" component={Link} to="/profile/">
                        <AccountCircle/>
                    </IconButton>
                    <IconButton color="inherit" onClick={handleLogout}>
                        <LogoutIcon/>
                    </IconButton>
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
                        </CardContent>
                        <CardActions sx={{justifyContent: 'space-between'}}>
                            <Button size="small" onClick={() => deleteExistingBooking(booking.id)}>Отменить</Button>
                            <Button size="small" onClick={() => {
                                setCurrentBooking({
                                    ...currentBooking,
                                    ...booking, // spread all properties of booking into currentBooking
                                });
                                setDialogOpen(true);
                            }}>Оставить оценку</Button>
                        </CardActions>
                    </Card>
                )}
                <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                    <DialogTitle>{"Добавить отзыв"}</DialogTitle>

                    <DialogContent>
                        <DialogContentText>
                            {"Заполните поля ниже"}
                        </DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Комментарий"
                            type="text"
                            fullWidth
                            variant="standard"
                            value={currentBooking ? currentBooking.comment : ""}
                            onChange={e => {
                                setCurrentBooking({...currentBooking, comment: e.target.value});
                            }}
                        />
                        <TextField
                            margin="dense"
                            label="Рейтинг"
                            type="text"
                            fullWidth
                            variant="standard"
                            value={currentBooking ? currentBooking.rating : ""}
                            onChange={e => {
                                setCurrentBooking({...currentBooking, rating: e.target.value});
                            }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button onClick={() => {
                            addFeedbackForBooking()
                            setDialogOpen(false);
                        }}>Сохранить</Button>
                    </DialogActions>
                </Dialog>

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