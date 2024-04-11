const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const passwordRegex = /^[a-zA-Z0-9`!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]{6,}$/;

const validateInput = (input, regex, emptyErrorMsg, formatErrorMsg) => {
    if (!input) {
        return {isValid: false, error: emptyErrorMsg};
    } else if (!regex.test(input)) {
        return {isValid: false, error: formatErrorMsg};
    } else {
        return {isValid: true, error: ''};
    }
}

export const validateEmail = email =>
    validateInput(email, emailRegex, 'Требуется ввести email', 'Неверный формат электронной почты');

export const validatePassword = password => validateInput(
    password,
    passwordRegex,
    'Требуется ввести пароль',
    'Пароль должен содержать не менее 6 символов и может содержать только латинские буквы, цифры и специальные символы.'
);

export const validateEmpty = (input, errorMsg) => {
    if (!input) {
        return {isValid: false, error: errorMsg};
    } else {
        return {isValid: true, error: ''};
    }
}