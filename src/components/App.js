import React, {Component} from "react";
import {render} from "react-dom";
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import {ThemeProvider} from "@mui/material";
import {defaultTheme} from "./utils/AppTheme";
import LoginPage from "./authorization/LoginPage";
import RegisterCustomerPage from "./authorization/RegisterCustomerPage";
import RegisterAdminPage from "./authorization/RegisterAdminPage";
import CustomerProfilePage from "./customer/CustomerProfile";
import AdminProfilePage from "./admin/AdminProfile";
import ServicesPage from "./admin/ServicesPage";
import ProvidersPage from "./admin/ProvidersPage";
import AddSchedulePage from "./admin/test";
import BookingPage from "./booking/BookingPage";
import CustomerBookingsPage from "./customer/CustomerBookingsPage";
import AdminBookingsPage from "./admin/AdminBookingsPage";

export default class App extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Router>
                <Routes>
                    <Route path="/" element={<p>This is the home page</p>}/>
                    <Route path="/login" element={<LoginPage/>}/>
                    <Route path="/register" element={<RegisterCustomerPage/>}/>
                    <Route path="/register/admin" element={<RegisterAdminPage/>}/>
                    <Route path="/profile" element={<CustomerProfilePage/>}/>
                    <Route path="/admin" element={<AdminProfilePage/>}/>
                    <Route path="/admin/services" element={<ServicesPage/>}/>
                    <Route path="/admin/providers" element={<ProvidersPage/>}/>
                    <Route path="/test" element={<AddSchedulePage/>}/>
                    <Route path="/booking/:adminId" element={<BookingPage />} />
                    <Route path="profile/bookings" element={<CustomerBookingsPage/>}/>
                    <Route path="admin/bookings" element={<AdminBookingsPage/>}/>
                </Routes>
            </Router>
        );
    }
}

render(
    <ThemeProvider theme={defaultTheme}>
        <App/>
    </ThemeProvider>,
    document.getElementById("app")
);