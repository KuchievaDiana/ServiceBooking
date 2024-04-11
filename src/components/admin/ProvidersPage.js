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

import {getUser} from "../user/Requests";
import {getProviders, addProvider, updateProvider, deleteProvider, addProviderSchedule} from "./Requests";

export default function ProvidersPage() {
    const [user, setUser] = useState(JSON.parse(Cookies.get('user') || '{}'));
    const [providers, setProviders] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [currentProvider, setCurrentProvider] = useState({first_name: '', last_name: ''});
    const [selectedMenu, setSelectedMenu] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [startTime, setStartTime] = useState("");
    const [firstNameError, setFirstNameError] = useState(null);
    const [lastNameError, setLastNameError] = useState(null);
    const [endTime, setEndTime] = useState("");
    const [dayOfWeek, setDayOfWeek] = useState(1); // По умолчанию понедельник
    const [formType, setFormType] = useState("add"); // Состояние для определения типа формы
    const [startTimeError, setStartTimeError] = useState(null); // Состояние для отображения ошибки времени начала
    const [endTimeError, setEndTimeError] = useState(null); // Состояние для отображения ошибки времени окончания
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            if (user == null) {
                const fetchedUser = await getUser(setError);
                setUser(fetchedUser);
            }
            setProviders(await getProviders(user.id, setError));
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

    const addNewProvider = async () => {
        // Проверка наличия имени и фамилии провайдера
        if (!currentProvider.first_name) {
            setFirstNameError("Please enter first name");
            return;
        }
        if (!currentProvider.last_name) {
            setLastNameError("Please enter last name");
            return;
        }

        try {
            const response = await addProvider(user.id, currentProvider.first_name, currentProvider.last_name, setError, setSuccess);
            if (response) {
                setSuccess("Исполнитель успешно добавлен");
                setProviders([...providers, response]); // Добавляем нового провайдера к существующему списку
                setDialogOpen(false); // Закрываем диалоговое окно после успешного добавления
            } else {
                setError("Ошибка при добавлении исполнителя");
            }
        } catch (error) {
            setError("Ошибка при добавлении исполнителя");
        }
    };

    const deleteExistingProvider = async (providerId) => {
        try {
            await deleteProvider(user.id, providerId, setError, setSuccess);
            setProviders(prevProviders => prevProviders.filter(provider => provider.id !== providerId));
            setSuccess("Исполнитель успешно удален");
            setError(null);
        } catch (error) {
            setError("Ошибка при удалении исполнителя: " + error.message);
            setSuccess(null);
        }
    };

    const updateExistingProvider = async (provider) => {
        try {
            const response = await updateProvider(user.id, currentProvider.id, provider, setError, setSuccess);
            setProviders(prevProviders => prevProviders.map(p => (p.id === currentProvider.id ? response : p)));
            setSuccess("Исполнитель успешно обновлен");
            setError(null);
        } catch (error) {
            setError("Ошибка при обновлении исполнителя: " + error.message);
            setSuccess(null);
        }
    };

    const addScheduleForProvider = async () => {
        // Проверяем формат времени перед отправкой запроса
        const timeFormat = /^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
        if (!timeFormat.test(startTime)) {
            setStartTimeError("Неверный формат. Пожалуйста используйте формат HH:MM:SS.");
            return;
        } else {
            setStartTimeError(null);
        }

        if (!timeFormat.test(endTime)) {
            setEndTimeError("Неверный формат. Пожалуйста используйте формат HH:MM:SS.");
            return;
        } else {
            setEndTimeError(null);
        }

        try {
            const response = await addProviderSchedule(user.id, currentProvider.id, dayOfWeek, startTime, endTime, setError, setSuccess);
            if (response) {
                setSuccess("Расписание успешно добавлено!");
                setDialogOpen(false);
            } else {
                setError("Ошибка при добавлении расписания");
            }
        } catch (error) {
            setError("Ошибка при добавлении расписания");
        }
    };

    return (
        <Container maxWidth="sm" style={{maxHeight: 'calc(100vh - 64px)', overflowY: 'auto'}}>
            <CssBaseline/>
            <AppBar position="static">
                <Toolbar>
                    <Typography component="h1" variant="h5" sx={{flexGrow: 1, textAlign: 'center'}}>
                        Исполнители
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
                padding: '0 20px', // добавляем отступы слева и справа
            }}>
                {providers.map(provider =>
                    <Card key={provider.id} sx={{marginBottom: '20px', width: '100%'}}>
                        <CardContent>
                            <Typography variant="h5" component="div">
                                {provider.first_name} {provider.last_name}
                            </Typography>
                            {/* Другие поля провайдера, если необходимо */}
                        </CardContent>
                        <CardActions sx={{justifyContent: 'space-between'}}>
                            <Button size="small" onClick={() => {
                                setCurrentProvider({...provider});
                                setFormType("update"); // Устанавливаем тип формы для редактирования
                                setDialogOpen(true);
                            }}>Редактировать</Button>
                            <Button size="small" onClick={() => deleteExistingProvider(provider.id)}>Удалить</Button>
                            {/* Добавляем кнопку "Добавить расписание" */}
                            <Button size="small" onClick={() => {
                                setCurrentProvider({...provider});
                                setFormType("addSchedule");
                                setDialogOpen(true);
                            }}>Добавить расписание</Button>
                        </CardActions>
                    </Card>
                )}
                <Button variant="contained" sx={{mt: 2}} onClick={() => {
                    setCurrentProvider({first_name: "", last_name: ""});
                    setFirstNameError(null); // Сброс ошибки при открытии диалогового окна
                    setLastNameError(null); // Сброс ошибки при открытии диалогового окна
                    setFormType("add"); // Устанавливаем тип формы для добавления
                    setDialogOpen(true);
                }}>Добавить исполнителя</Button>
                <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                    <DialogTitle>{formType === "add" ? "Добавить исполнителя" : formType === "addSchedule" ? "Добавить расписание" : "Редактировать"}</DialogTitle>

                    <DialogContent>
                        <DialogContentText>
                            {formType === "add" ? "Чтобы добавить нового исполнителя пожалуйста заполните поля ниже" :
                                formType === "addSchedule" ? `Чтобы добавить расписание для ${currentProvider ? currentProvider.first_name + " " + currentProvider.last_name : "исполнителя"}, пожалуйста выберите день недели и время начала и конца.` :
                                    "Чтобы отредактировать исполнителя пожалуйста обновите поля ниже."
                            }
                        </DialogContentText>
                        {formType === "addSchedule" &&
                            <>
                                <TextField
                                    select
                                    margin="dense"
                                    label="День недели"
                                    fullWidth
                                    variant="standard"
                                    value={dayOfWeek}
                                    onChange={(e) => setDayOfWeek(e.target.value)}
                                >
                                    {[
                                        {value: 1, label: "Понедельник"},
                                        {value: 2, label: "Вторник"},
                                        {value: 3, label: "Среда"},
                                        {value: 4, label: "Четверг"},
                                        {value: 5, label: "Пятница"},
                                        {value: 6, label: "Суббота"},
                                        {value: 7, label: "Воскресенье"}
                                    ].map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </TextField>
                                <TextField
                                    margin="dense"
                                    label="Время начала (00:00:00)"
                                    type="text"
                                    fullWidth
                                    variant="standard"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    error={!!startTimeError}
                                    helperText={startTimeError}
                                />
                                <TextField
                                    margin="dense"
                                    label="Время конца (00:00:00)"
                                    type="text"
                                    fullWidth
                                    variant="standard"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    error={!!endTimeError}
                                    helperText={endTimeError}
                                />
                            </>
                        }
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Имя"
                            type="text"
                            fullWidth
                            variant="standard"
                            value={currentProvider ? currentProvider.first_name : ""}
                            onChange={e => {
                                setCurrentProvider({...currentProvider, first_name: e.target.value});
                                setFirstNameError(null); // Сброс ошибки при изменении значения
                            }}
                            error={!!firstNameError}
                            helperText={firstNameError}
                            style={{display: formType !== "addSchedule" ? 'block' : 'none'}} // Условное отображение поля
                        />
                        <TextField
                            margin="dense"
                            label="Фамилия"
                            type="text"
                            fullWidth
                            variant="standard"
                            value={currentProvider ? currentProvider.last_name : ""}
                            onChange={e => {
                                setCurrentProvider({...currentProvider, last_name: e.target.value});
                                setLastNameError(null); // Сброс ошибки при изменении значения
                            }}
                            error={!!lastNameError}
                            helperText={lastNameError}
                            style={{display: formType !== "addSchedule" ? 'block' : 'none'}} // Условное отображение поля
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDialogOpen(false)}>Отменить</Button>
                        {formType === "add" && (
                            <Button onClick={() => {
                                if (formType === "add") {
                                    addNewProvider(currentProvider);
                                } else {
                                    updateExistingProvider(currentProvider);
                                }
                                setDialogOpen(false);
                            }}>Добавить</Button>
                        )}
                        {formType === "addSchedule" && <Button onClick={addScheduleForProvider}>Добавить</Button>}
                        {formType === "update" && (
                            <Button onClick={() => {
                                if (formType === "add") {
                                    addNewProvider(currentProvider);
                                } else {
                                    updateExistingProvider(currentProvider);
                                }
                                setDialogOpen(false);
                            }}>Обновить</Button>
                        )}
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