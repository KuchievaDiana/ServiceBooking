import {createTheme} from "@mui/material";

export const defaultTheme = createTheme({
    palette: {
        primary: {
            main: '#ff0080',
        },
        secondary: {
            main: '#cc0066',
        },
        error: {
            main: '#ff0000',
        },
        background: {
            default: '#fff',
        },
    },
    typography: {
        fontSize: 14,
    },
});