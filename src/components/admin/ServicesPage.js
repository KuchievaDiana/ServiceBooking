import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import {
    Box,
    Typography,
    CssBaseline,
    AppBar,
    Toolbar,
    IconButton,
    TextField,
    Button,
    Alert,
    Card,
    CardActions,
    CardContent,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Menu,
    MenuItem,
    Container,
} from '@mui/material';
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from '@mui/icons-material/Menu';

import { getUser, updateUser } from "../user/Requests";
import { getServices, addService, updateService, deleteService } from "./Requests";

export default function ServicesPage() {
    const [user, setUser] = useState(JSON.parse(Cookies.get('user') || '{}'));
    const [services, setServices] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [currentService, setCurrentService] = useState(null);
    const [selectedMenu, setSelectedMenu] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [nameError, setNameError] = useState(null);
    const [executionTimeError, setExecutionTimeError] = useState(null);
    const [currentTime, setCurrentTime] = useState("06:48");
    const [formType, setFormType] = useState("add");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            if (user == null) {
                const fetchedUser = await getUser(setError);
                setUser(fetchedUser);
            }
            setServices(await getServices(user.id, setError));
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


    const addNewService = async (service) => {
        try {
            const response = await addService(user.id, service.name, service.description, service.executionTime, setError, setSuccess);
            if (response) {
                setSuccess("Сервис успешно добавлен");
                setServices([...services, response]);
            } else {
                setError("Ошибка при добавлении сервиса");
            }
        } catch (error) {
            setError("Ошибка при добавлении сервиса");
        }
    };

    const updateExistingService = async (service) => {
        try {
            const response = await updateService(user.id, currentService.id, service, setError, setSuccess);
            if (response) {
                setSuccess("Сервис успешно обновлен");
                const updatedServices = services.map(s => (s.id === currentService.id ? response : s));
                setServices(updatedServices);
            } else {
                setError("Ошибка при обновлении сервиса");
            }
        } catch (error) {
            setError("Ошибка при обновлении сервиса");
        }
    };

    const deleteExistingService = async (serviceId) => {
        const response = await deleteService(user.id, serviceId, setError, setSuccess);
        setServices(services.filter(service => service.id !== serviceId));
    };

    return (
        <Container maxWidth="sm" style={{ maxHeight: 'calc(100vh - 64px)', overflowY: 'auto' }}>
            <CssBaseline/>
            <AppBar position="static">
                <Toolbar>
                    <Typography component="h1" variant="h5" sx={{flexGrow: 1, textAlign: 'center'}}>
                        Сервисы
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
                {services.map(service =>
                    <Card key={service.id} sx={{ marginBottom: '20px', width: '100%' }}>
                        <CardContent>
                            <Typography variant="h5" component="div">
                                {service.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {service.description}
                            </Typography>
                        </CardContent>
                        <CardActions sx={{ justifyContent: 'space-between' }}>
                            <Button size="small" onClick={() => {
                                setCurrentService({...service});
                                setCurrentTime(service.executionTime);
                                setFormType("update");
                                setDialogOpen(true);
                            }}>Редактировать</Button>
                            <Button size="small" onClick={() => deleteExistingService(service.id)}>Удалить</Button>
                        </CardActions>
                    </Card>
                )}
                <Button variant="contained" sx={{ mt: 2 }} onClick={() => {
                    setCurrentService({ name: "", executionTime: "", description: "" });
                    setFormType("add");
                    setDialogOpen(true);
                }}>Добавить сервис</Button>
                <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                    <DialogTitle>{formType === "add" ? "Добавить сервис" : "Редактировать сервис"}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            {formType === "add" ? "Чтобы добавить новый сервис, пожалуйста заполните поля ниже." : "Чтобы отредактировать сервис пожалуйста обновите поля ниже."}
                        </DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Название"
                            type="text"
                            fullWidth
                            variant="standard"
                            value={currentService ? currentService.name : ""}
                            onChange={e => setCurrentService({...currentService, name: e.target.value})}
                            error={!!nameError}
                            helperText={nameError}
                        />
                        <TextField
                            margin="dense"
                            label="Длительность"
                            id="time"
                            type="time"
                            fullWidth
                            variant="standard"
                            value={currentTime}
                            InputLabelProps={{shrink: true}}
                            inputProps={{step: 60}}
                            onChange={e => setCurrentTime(e.target.value)}
                            error={!!executionTimeError}
                            helperText={executionTimeError}
                        />
                        <TextField
                            margin="dense"
                            label="Описание"
                            type="text"
                            fullWidth
                            variant="standard"
                            value={currentService ? currentService.description : ""}
                            onChange={e => setCurrentService({...currentService, description: e.target.value})}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDialogOpen(false)}>Отменить</Button>
                        <Button onClick={() => {
                            if (formType === "add") {
                                addNewService(currentService);
                            } else {
                                updateExistingService(currentService);
                            }
                            setDialogOpen(false);
                        }}>{formType === "add" ? "Добавить" : "Обновить"}</Button>
                    </DialogActions>
                </Dialog>

                {error && (
                    <Alert severity="error" sx={{ mt: 5, width: '100%', textAlign: 'center' }}>{error}</Alert>
                )}
                {success && (
                    <Alert severity="success" sx={{ mt: 5, width: '100%', textAlign: 'center' }}>{success}</Alert>
                )}
            </Box>
        </Container>
    );
}