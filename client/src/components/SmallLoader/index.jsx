import React from "react";
import "./styles.scss";

const SmallLoader = ({ text = "Loading..." }) => {
    return (
        <div className="small-loader-container">
            <div className="small-loader-animation">
                <div className="small-jimu-loading"></div>
            </div>
            <span className="small-loader-text">{text}</span>
        </div>
    );
};

export default SmallLoader;
