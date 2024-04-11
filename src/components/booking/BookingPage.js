import React, {useEffect, useState} from 'react';
import {useParams} from "react-router-dom";
import {
    Container,
    Typography,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Box,
    Button,
    Snackbar
} from '@mui/material';
import {getServices, getProvider, getTime, createBooking, getUser} from "./Requests";

export default function BookingPage() {
    const {adminId} = useParams();
    const [services, setServices] = useState([]);
    const [providers, setProviders] = useState([]);
    const [selectedService, setSelectedService] = useState('');
    const [selectedProvider, setSelectedProvider] = useState('');
    const [providerSchedule, setProviderSchedule] = useState({dates: []});
    const [selectedTimeIndex, setSelectedTimeIndex] = useState(null)
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingSchedule, setLoadingSchedule] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    useEffect(() => {
        const fetchServicesAndProviders = async () => {
            try {
                const servicesData = await getServices(adminId, setError);
                const providerData = await getProvider(adminId, setError);
                console.log(servicesData)
                console.log(providerData)

                setServices(servicesData);
                setProviders(providerData);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchServicesAndProviders();
    }, [adminId]);

    const handleServiceChange = (event) => {
        setSelectedService(event.target.value);
    };

    const handleProviderChange = async (event) => {
        setSelectedProvider(event.target.value);

        try {
            setLoadingSchedule(true);
            const scheduleData = await getTime(adminId, selectedService, event.target.value, setError);
            setProviderSchedule(scheduleData);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoadingSchedule(false);
        }
    };

    function formatDate(input) {
        const dateTime = new Date(input);
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

    const handleCreateBooking = async () => {
        providerSchedule.dates[selectedTimeIndex][0] = providerSchedule.dates[selectedTimeIndex][0].substring(0, providerSchedule.dates[selectedTimeIndex][0].length - 1);

        try {
            await createBooking(adminId, selectedService, selectedProvider, providerSchedule.dates[selectedTimeIndex][0], setError);
            setSnackbarMessage("Booking created successfully!");
            setSnackbarOpen(true);
        } catch (error) {
            setError(error.message);
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    return (
        <Container>
            <Box bgcolor="primary.main" p={2} mb={2} borderRadius={4} textAlign="center">
                <Typography variant="h3" component="h1" color="white">Booking Page</Typography>
            </Box>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Box bgcolor="background.paper" p={3} borderRadius={4}>
                        <Typography variant="h5" gutterBottom>Select Service</Typography>
                        {loading ? (
                            <CircularProgress/>
                        ) : error ? (
                            <Typography variant="body1" color="error">{error}</Typography>
                        ) : (
                            <FormControl fullWidth>
                                <InputLabel id="service-select-label">Service</InputLabel>
                                <Select
                                    labelId="service-select-label"
                                    id="service-select"
                                    value={selectedService}
                                    onChange={handleServiceChange}
                                >
                                    {services.map(service => (
                                        <MenuItem key={service.id} value={service.id}>
                                            {service.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}
                    </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Box bgcolor="background.paper" p={3} borderRadius={4}>
                        <Typography variant="h5" gutterBottom>Select Provider</Typography>
                        {!error && !loading && (
                            <FormControl fullWidth>
                                <InputLabel id="provider-select-label">Provider</InputLabel>
                                <Select
                                    labelId="provider-select-label"
                                    id="provider-select"
                                    value={selectedProvider}
                                    onChange={handleProviderChange}
                                >
                                    {providers.map(provider => (
                                        <MenuItem key={provider.id} value={provider.id}>
                                            {`${provider.first_name} ${provider.last_name}`}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}
                    </Box>
                </Grid>
                <Grid item xs={12}>
                    <Box bgcolor="background.paper" p={3} borderRadius={4}>
                        <Typography variant="h5" gutterBottom>Provider Schedule</Typography>
                        {!error && !loadingSchedule && selectedProvider && (
                            <FormControl fullWidth>
                                <InputLabel id="provider-schedule-label">Schedule</InputLabel>
                                <Select
                                    labelId="provider-schedule-label"
                                    id="provider-schedule"
                                    value={selectedTimeIndex} // Use selectedTimeIndex as value
                                    onChange={(event) => setSelectedTimeIndex(event.target.value)} // Update selectedTimeIndex on change
                                >
                                    {providerSchedule.dates.map((dateRange, index) => (
                                        <MenuItem
                                            key={index}
                                            value={index}
                                            selected={index === selectedTimeIndex} // Apply selected prop
                                            sx={{backgroundColor: index === selectedTimeIndex ? 'rgba(0, 0, 0, 0.1)' : 'transparent'}} // Apply custom styling
                                        >
                                            {`${formatDate(dateRange[0])} - ${formatDate(dateRange[1])}`}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}
                    </Box>
                </Grid>
                <Grid item xs={12}>
                    <Button variant="contained" color="primary" onClick={handleCreateBooking}>
                        Создать бронирование
                    </Button>
                </Grid>
            </Grid>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                message={snackbarMessage}
                action={
                    <Button color="inherit" size="small" onClick={handleCloseSnackbar}>
                        Close
                    </Button>
                }
            />
        </Container>
    );
}
