import Cookies from "js-cookie";
import {ADMIN_USER_TYPE, CUSTOMER_USER_TYPE} from "../user/Constants";
import {getUser} from "../user/Requests";

export const login = async (email, password, navigate, setError) => {
    const requestOptions = {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({email: email, password: password}),
    };

    try {
        const response = await fetch("/api/login/", requestOptions);
        const data = await response.json();

        if (response.status === 401) {
            setError('Неправильная почта или пароль');
        } else if (!response.ok) {
            setError('Что-то пошло не так');
        } else {
            const token = data.token;
            Cookies.set('token', token, {expires: 7, secure: true});

            const user = await getUser(setError);
            Cookies.set('user', JSON.stringify(user));

            if (user.user_type !== ADMIN_USER_TYPE && user.user_type !== CUSTOMER_USER_TYPE) {
                setError('Что-то пошло не так');
            } else {
                setError(null);

                if (user.user_type === ADMIN_USER_TYPE) {
                    navigate('/admin');
                } else {
                    navigate('/profile');
                }
            }
        }
    } catch (error) {
        console.error('Error:', error);
        setError('Что-то пошло не так');
    }
}

export const register = async (email, password, firstName, lastName, companyName, userType, navigate, setError) => {
    const requestOptions = {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            email: email,
            password: password,
            first_name: firstName,
            last_name: lastName,
            company_name: companyName,
            user_type: userType
        }),
    };

    try {
        const response = await fetch("/api/register/", requestOptions);
        const data = await response.json();

        if (response.status === 409) {
            setError('Это электронная почта уже существует');
        } else if (!response.ok) {
            setError('Что-то пошло не так');
        } else {
             const token = data.token;
             Cookies.set('token', token, {expires: 7, secure: true});

            const user = await getUser(setError);
            Cookies.set('user', JSON.stringify(user));

            if (user.user_type !== CUSTOMER_USER_TYPE && user.user_type !== ADMIN_USER_TYPE) {
                setError('Что-то пошло не так');
            } else {
                setError(null)
                if (user.user_type === ADMIN_USER_TYPE) {
                    navigate('/admin');
                } else if (user.user_type === CUSTOMER_USER_TYPE) {
                    navigate('/profile');
                }
            }
        }
    } catch (error) {
        console.error('Error:', error);
        setError('Что-то пошло не так');
    }
}

export const logout = (navigate) => {
    Cookies.remove('token');
    Cookies.remove('user');
    navigate("/login");
}

export const changePassword = async (oldPassword, newPassword, setError, setSuccess) => {
    const requestOptions = {
        method: "POST",
        headers: {"Content-Type": "application/json", "Authorization": 'Token ' + Cookies.get('token')},
        body: JSON.stringify({
            old_password: oldPassword,
            new_password: newPassword,
        }),
    };

    try {
        const response = await fetch("/api/password-change/", requestOptions);
        const data = await response.json();

        if (response.status === 403) {
            setError('Неверный старый пароль');
        } else if (!response.ok) {
            setError('Что-то пошло не так');
        } else {
            setSuccess('Данные успешно обновлены')
            setError(null);
            return data;
        }
    } catch (error) {
        console.error('Error:', error);
        setError('Что-то пошло не так');
    }
}