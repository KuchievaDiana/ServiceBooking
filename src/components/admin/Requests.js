import Cookies from "js-cookie";

export const getServices = async (businessId, setError) => {
    console.log(Cookies.get('token'))
    const requestOptions = {
        method: "GET",
        headers: {"Content-Type": "application/json", "Authorization": 'Token ' + Cookies.get('token')},
    };

    try {
        const response = await fetch("/api/services/" + businessId, requestOptions);
        const data = await response.json();

        if (response.status === 401) {
            throw new Error('Необходимо авторизоваться');
        }
        if (!response.ok) {
            throw new Error('Что-то пошло не так');
        }

        setError(null);
        return data;
    } catch (error) {
        console.error('Error:', error);
        setError('Что-то пошло не так');
    }
}

export const addService = async (businessId, serviceName, description, execution_duration, setError, setSuccess) => {
    const requestOptions = {
        method: "POST",
        headers: {"Content-Type": "application/json", "Authorization": 'Token ' + Cookies.get('token')},
        body: JSON.stringify({
            name: serviceName,
            description: description,
            execution_duration: execution_duration,
        }),
    };

    try {
        const response = await fetch("/api/services/" + businessId + "/", requestOptions);
        const data = await response.json();

        if (response.status === 401) {
            throw new Error('Необходимо авторизоваться');
        }
        if (!response.ok) {
            throw new Error('Что-то пошло не так');
        }

        setSuccess('Сервис успешно добавлен')
        setError(null);
        return data;
    } catch (error) {
        console.error('Error:', error);
        setSuccess(null);
        setError('Что-то пошло не так');
    }
}


export const updateService = async (businessId, serviceId, updatedServiceData, setError, setSuccess) => {
    const requestOptions = {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": 'Token ' + Cookies.get('token')
        },
        body: JSON.stringify(updatedServiceData),
    };

    try {
        const response = await fetch("/api/service/" + businessId + "/" + serviceId + "/", requestOptions);
        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Необходимо авторизоваться');
            } else {
                throw new Error('Ошибка ' + response.status + ': ' + data.detail);
            }
        }

        setSuccess('Сервис успешно обновлен');
        setError(null);
        return data;
    } catch (error) {
        console.error('Error:', error.message);
        setSuccess(null);
        setError('Ошибка при обновлении сервиса: ' + error.message);
    }
}


export const deleteService = async (businessId, serviceId, setError, setSuccess) => {
    const requestOptions = {
        method: "DELETE",
        headers: {"Content-Type": "application/json", "Authorization": 'Token ' + Cookies.get('token')},
    };

    try {
        const response = await fetch("/api/service/" + businessId + "/" + serviceId + "/", requestOptions);

        if (response.status === 401) {
            throw new Error('Необходимо авторизоваться');
        }

        if (!response.ok) {
            throw new Error('Что-то пошло не так');
        }

        setSuccess('Сервис успешно удален');
        setError(null);
    } catch (error) {
        setSuccess(null);
        setError('Что-то пошло не так');
    }
}

export const getProviders = async (businessId, setError) => {
    console.log(Cookies.get('token'))
    const requestOptions = {
        method: "GET",
        headers: {"Content-Type": "application/json", "Authorization": 'Token ' + Cookies.get('token')},
    };

    try {
        const response = await fetch("/api/providers/" + businessId, requestOptions);
        const data = await response.json();

        if (response.status === 401) {
            throw new Error('Необходимо авторизоваться');
        }
        if (!response.ok) {
            throw new Error('Что-то пошло не так');
        }

        setError(null);
        return data;
    } catch (error) {
        console.error('Error:', error);
        setError('Что-то пошло не так');
    }
};

export const addProvider = async (businessId, firstname, lastname, setError, setSuccess) => {
    const requestOptions = {
        method: "POST",
        headers: {"Content-Type": "application/json", "Authorization": 'Token ' + Cookies.get('token')},
        body: JSON.stringify({
            first_name: firstname,
            last_name: lastname,
        }),
    };

    try {
        const response = await fetch("/api/providers/" + businessId + "/", requestOptions);
        const data = await response.json();

        if (response.status === 401) {
            throw new Error('Необходимо авторизоваться');
        }
        if (!response.ok) {
            throw new Error('Что-то пошло не так');
        }

        setSuccess('Исполнитель успешно добавлен')
        setError(null);
        return data;
    } catch (error) {
        console.error('Error:', error);
        setSuccess(null);
        setError('Что-то пошло не так');
    }
};


// Обновление информации о провайдере
export const updateProvider = async (businessId, providerId, providerData, setError, setSuccess) => {
   const requestOptions = {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": 'Token ' + Cookies.get('token')
        },
        body: JSON.stringify(providerData),
    };

    try {
        const response = await fetch("/api/provider/" + businessId + "/" + providerId + "/", requestOptions);
        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Необходимо авторизоваться');
            } else {
                throw new Error('Ошибка ' + response.status + ': ' + data.detail);
            }
        }

        setSuccess('Исполнитель успешно обновлен');
        setError(null);
        return data;
    } catch (error) {
        console.error('Error:', error.message);
        setSuccess(null);
        setError('Ошибка при обновлении исполнителя: ' + error.message);
    }
};

// Удаление провайдера
export const deleteProvider = async (businessId, providerId, setError, setSuccess) => {
    const requestOptions = {
        method: "DELETE",
        headers: {"Content-Type": "application/json", "Authorization": 'Token ' + Cookies.get('token')},
    };

    try {
        const response = await fetch("/api/provider/" + businessId + "/" + providerId + "/", requestOptions);

        if (response.status === 401) {
            throw new Error('Необходимо авторизоваться');
        }

        if (!response.ok) {
            throw new Error('Что-то пошло не так');
        }

        setSuccess('Исполнитель успешно удален');
        setError(null);
    } catch (error) {
        setSuccess(null);
        setError('Что-то пошло не так');
    }
};

// Получение расписания провайдера
export const getProviderSchedule = async (businessId, providerId, setError) => {
    const requestOptions = {
        method: "GET",
        headers: {"Content-Type": "application/json", "Authorization": 'Token ' + Cookies.get('token')},
    };

    try {
        const response = await fetch("/api/provider/" + businessId + "/" + providerId + "/" + "schedule/", requestOptions);
        const data = await response.json();

        if (response.status === 401) {
            throw new Error('Необходимо авторизоваться');
        }
        if (!response.ok) {
            throw new Error('Что-то пошло не так');
        }

        setError(null);
        return data;
    } catch (error) {
        console.error('Error:', error);
        setError('Что-то пошло не так');
    }
};

// Добавление элемента расписания провайдера
export const addProviderSchedule = async (businessId, providerId, dayOfWeek, startTime, endTime, setError, setSuccess) => {
    const requestOptions = {
        method: "POST",
        headers: {"Content-Type": "application/json", "Authorization": 'Token ' + Cookies.get('token')},
        body: JSON.stringify({
            day_of_week: dayOfWeek,
            start_time: startTime,
            end_time: endTime,
        }),
    };

    try {
        const response = await fetch("/api/provider/" + businessId + "/" + providerId + "/schedule/", requestOptions);
        const data = await response.json();

        if (response.status === 401) {
            throw new Error('Необходимо авторизоваться');
        }
        if (!response.ok) {
            throw new Error('Что-то пошло не так');
        }

        setSuccess('Элемент расписания успешно добавлен');
        setError(null);
        return data;
    } catch (error) {
        console.error('Error:', error);
        setSuccess(null);
        setError('Что-то пошло не так');
    }
};

// Обновление элемента расписания провайдера
export const updateProviderScheduleItem = async (businessId, providerId, scheduleItemId, scheduleItemData, setError, setSuccess) => {
    const requestOptions = {
        method: "PATCH",
        headers: {"Content-Type": "application/json", "Authorization": 'Token ' + Cookies.get('token')},
        body: JSON.stringify(scheduleItemData),
    };

    try {
        const response = await fetch("/api/provider/" + businessId + "/" +providerId + "/schedule-item/", requestOptions);
        const data = await response.json();

        if (response.status === 401) {
            throw new Error('Необходимо авторизоваться');
        }
        if (!response.ok) {
            throw new Error('Что-то пошло не так');
        }

        setSuccess('Элемент расписания успешно обновлен');
        setError(null);
        return data;
    } catch (error) {
        console.error('Error:', error);
        setSuccess(null);
        setError('Что-то пошло не так');
    }
};

// Удаление элемента расписания провайдера
export const deleteProviderScheduleItem = async (businessId, providerId, scheduleItemId, setError, setSuccess) => {
    const requestOptions = {
        method: "DELETE",
        headers: {"Content-Type": "application/json", "Authorization": 'Token ' + Cookies.get('token')},
    };

    try {
        const response = await fetch("/api/provider/" + businessId + "/" +providerId + "/schedule-item/", requestOptions);

        if (response.status === 401) {
            throw new Error('Необходимо авторизоваться');
        }
        if (!response.ok) {
            throw new Error('Что-то пошло не так');
        }

        setSuccess('Элемент расписания успешно удален');
        setError(null);
    } catch (error) {
        console.error('Error:', error);
        setSuccess(null);
        setError('Что-то пошло не так');
    }
};

export const getUser = async (userId, setError) => {
    console.log(Cookies.get('token'))
    const requestOptions = {
        method: "GET",
        headers: {"Content-Type": "application/json", "Authorization": 'Token ' + Cookies.get('token')},
    };

    try {
        const response = await fetch("/api/user/" + userId, requestOptions);
        const data = await response.json();

        if (response.status === 401) {
            throw new Error('Необходимо авторизоваться');
        }
        if (!response.ok) {
            throw new Error('Что-то пошло не так');
        }

        setError(null);
        return data;
    } catch (error) {
        console.error('Error:', error);
        setError('Что-то пошло не так');
    }
}

export const getProvider = async (businessId, providerId, setError) => {
    console.log(Cookies.get('token'))
    const requestOptions = {
        method: "GET",
        headers: {"Content-Type": "application/json", "Authorization": 'Token ' + Cookies.get('token')},
    };

    try {
        const response = await fetch("/api/provider/" + businessId + '/' + providerId, requestOptions);
        const data = await response.json();

        if (response.status === 401) {
            throw new Error('Необходимо авторизоваться');
        }
        if (!response.ok) {
            throw new Error('Что-то пошло не так');
        }

        setError(null);
        return data;
    } catch (error) {
        console.error('Error:', error);
        setError('Что-то пошло не так');
    }
}

export const getBookings = async (setError) => {
    const requestOptions = {
        method: "GET",
        headers: {"Content-Type": "application/json", "Authorization": 'Token ' + Cookies.get('token')},
    };

    try {
        const response = await fetch("/api/bookings/", requestOptions);
        const data = await response.json();

        if (response.status === 401) {
            throw new Error('Необходимо авторизоваться');
        }
        if (!response.ok) {
            throw new Error('Что-то пошло не так');
        }

        for (let i = 0; i < data.length; i++) {
            data[i].customer = await getUser(data[i].customer, setError)
            data[i].business = await getUser(data[i].business, setError)
            data[i].service_provider = await getProvider(data[i].business.id, data[i].service_provider, setError)
        }

        setError(null);
        return data;
    } catch (error) {
        console.error('Error:', error);
        setError('Что-то пошло не так');
    }
}

export const deleteBooking = async (bookingId, setError, setSuccess) => {
    const requestOptions = {
        method: "DELETE",
        headers: {"Content-Type": "application/json", "Authorization": 'Token ' + Cookies.get('token')},
    };

    try {
        const response = await fetch("/api/booking/" + bookingId + "/", requestOptions);

        if (response.status === 401) {
            throw new Error('Необходимо авторизоваться');
        }

        if (!response.ok) {
            throw new Error('Что-то пошло не так');
        }

        setSuccess('Бронирование успешно отменено');
        setError(null);
    } catch (error) {
        setSuccess(null);
        setError('Что-то пошло не так');
    }
}

export const addFeedback = async (bookingId, comment, rating, setError) => {
    const requestOptions = {
        method: "PATCH",
        headers: {"Content-Type": "application/json", "Authorization": 'Token ' + Cookies.get('token')},
        body: JSON.stringify({
            rating: rating,
            comment: comment,
        }),
    };

    try {
        const response = await fetch("/api/booking/" + bookingId + "/", requestOptions);
        const data = await response.json();

        if (response.status === 401) {
            throw new Error('Необходимо авторизоваться');
        }
        if (!response.ok) {
            throw new Error('Что-то пошло не так');
        }

        setError(null);
        return data;
    } catch (error) {
        console.error('Error:', error);
        setError('Что-то пошло не так');
    }
}