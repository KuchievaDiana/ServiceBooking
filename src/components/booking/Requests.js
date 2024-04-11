import Cookies from "js-cookie";

export const getUser = async () => {
    console.log(Cookies.get('token'))
    const requestOptions = {
        method: "GET",
        headers: {"Content-Type": "application/json", "Authorization": 'Token ' + Cookies.get('token')},
    };

    try {
        const response = await fetch("/api/profile/", requestOptions);
        const data = await response.json();

        if (response.status === 401) {
            throw new Error('Необходимо авторизоваться');
        }

        if (!response.ok) {
            throw new Error('Что-то пошло не так');
        }


        Cookies.set('user', JSON.stringify(data));
        return data;
    } catch (error) {
        console.error('Error:', error);

    }
}

export const getServices = async (businessId, setError) => {
    const token = Cookies.get('token');
    console.log(token);
    const requestOptions = {
        method: "GET",
        headers: {"Content-Type": "application/json", "Authorization": 'Token ' + token},
    };

    try {
        const response = await fetch(`/api/services/${businessId}`, requestOptions);
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

export const getProvider = async (businessId, setError) => {
    const token = Cookies.get('token');
    console.log(token);
    const requestOptions = {
        method: "GET",
        headers: {"Content-Type": "application/json", "Authorization": 'Token ' + token},
    };

    try {
        const response = await fetch(`/api/providers/${businessId}`, requestOptions);
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

export const getProviderSchedule = async (businessId, providerId, setError) => {
    const token = Cookies.get('token');
    const requestOptions = {
        method: "GET",
        headers: {"Content-Type": "application/json", "Authorization": 'Token ' + token},
    };

    try {
        const response = await fetch(`/api/provider/${businessId}/${providerId}/schedule/`, requestOptions);
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

export const createBooking = async (adminId, service, service_provider, startTime, setError) => {
    const token = Cookies.get('token');

    const requestOptions = {
        method: "POST",
        headers: {"Content-Type": "application/json", "Authorization": 'Token ' + token},
        body: JSON.stringify(
            {
                start_time: startTime,
                business: adminId,
                service: service,
                service_provider: service_provider,
            }
        )
    };
    console.log(requestOptions)

    try {
        const response = await fetch(`/api/bookings/`, requestOptions);
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

export const getTime = async (businessId, serviceId, serviceProviderId, setError) => {
    const token = Cookies.get('token');
    const requestOptions = {
        method: "GET",
        headers: {"Content-Type": "application/json", "Authorization": 'Token ' + token},
    };

    try {
        const response = await fetch(`/api/${businessId}/${serviceId}/${serviceProviderId}`, requestOptions);
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
        setError('Что-то пошло не так');
    }
};
