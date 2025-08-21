import React from "react";
import "./styles.scss";

const Loader = ({ text = "Loading..." }) => {
    return (
        <div className="loader-container">
            <div className="loader-animation">
                <div className="jimu-primary-loading"></div>
            </div>
            <div className="loader-text">
                <p>{text}</p>
            </div>
        </div>
    );
};

export default Loader;
