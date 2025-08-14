import React, { useState } from "react";
import "./styles.scss";
import Logo from "./components/logo";
import NavLink from "./components/navlink";
import SearchBar from "./components/searchbar";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import server from "../../api/server";

import { LogoutUser } from "../../actions/user_actions";

const NavBar = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        dispatch(LogoutUser());
        window.location = `${server}/api/auth/logout`;
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <nav className="navbar">
            <div className="active">
                <div className="nav-content">
                    <span onClick={() => navigate("/dashboard")}>
                        <Logo />
                    </span>
                    <SearchBar />
                    <div className="navlinks desktop-nav">
                        <NavLink text={"Dashboard"} onClick={() => navigate("/dashboard")} />
                        <NavLink text={"Profile"} onClick={() => navigate("/profile")} />
                        <NavLink text={"Log Out"} onClick={handleLogout} />
                    </div>
                    <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
                        <div className={`three-dots ${isMobileMenuOpen ? 'cross' : ''}`}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="passive">
                <SearchBar type={"passive"} />
            </div>
            {/* Mobile Menu Overlay */}
            <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
                <div className="mobile-menu-content">
                    <NavLink text={"Dashboard"} onClick={() => { navigate("/dashboard"); setIsMobileMenuOpen(false); }} />
                    <NavLink text={"Profile"} onClick={() => { navigate("/profile"); setIsMobileMenuOpen(false); }} />
                    <NavLink text={"Log Out"} onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} />
                </div>
            </div>
        </nav>
    );
};

export default NavBar;
