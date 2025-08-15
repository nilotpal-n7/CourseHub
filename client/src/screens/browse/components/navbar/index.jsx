import React, { useState } from "react";
import "./styles.scss";
import Logo from "./components/logo";
import NavLink from "../../../../components/navbar/components/navlink";
import SearchBar from "../../../../components/navbar/components/searchbar";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { LogoutUser } from "../../../../actions/user_actions";
import server from "../../../../api/server";

const NavBarBrowseScreen = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    const handleLogout = () => {
        dispatch(LogoutUser());
        window.location = `${server}/api/auth/logout`;
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };
    
    return (
        <nav className="nav-browse">
            <div className="nav-content">
                <span onClick={() => navigate("/dashboard")}>
                    <Logo />
                </span>
                {/* <SearchBar /> */}
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

export default NavBarBrowseScreen;
