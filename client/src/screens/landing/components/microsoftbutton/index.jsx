import "./styles.scss";
const MicrosoftSignIn = ({ setClicked }) => {
    return (
        <button
            className="microsoft-signin-btn"
            onClick={setClicked}
            type="button"
            aria-label="Sign in with Microsoft"
            tabIndex={0}
        >
            <div className="logo" aria-hidden="true"></div>
            <span>Sign in with Microsoft</span>
        </button>
    );
};

export default MicrosoftSignIn;
