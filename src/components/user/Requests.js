import Cookies from "js-cookie";

export const getUser = async (setError) => {
    console.log(Cookies.get('token')) // TODO: remove
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

        setError(null);
        Cookies.set('user', JSON.stringify(data));
        return data;
    } catch (error) {
        console.error('Error:', error);
        setError('Что-то пошло не так');
    }
}

export const updateUser = async (firstName, lastName, companyName, setUser, setError, setSuccess) => {
    const requestOptions = {
        method: "PATCH",
        headers: {"Content-Type": "application/json", "Authorization": 'Token ' + Cookies.get('token')},
        body: JSON.stringify({
            first_name: firstName,
            last_name: lastName,
            company_name: companyName,
        }),
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

        setUser(data);
        Cookies.set('user', JSON.stringify(data));
        setSuccess('Данные успешно обновлены');
        setError(null);
        return data;
    } catch (error) {
        console.error('Error:', error);
        setSuccess(null);
        setError('Что-то пошло не так');
    }
}