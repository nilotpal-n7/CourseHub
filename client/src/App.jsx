import { useState, useEffect } from "react";
import BrowseScreen from "./screens/browse";
import Dashboard from "./screens/dashboard";
import LandingPage from "./screens/landing";
import LoadingPage from "./loading.jsx";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import PrivateRoutes from "./router_utils/PrivateRoutes";
import ProfilePage from "./screens/profile.js";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector, useDispatch } from "react-redux";
import ErrorScreen from "./screens/error";
import { LoadLocalCourses } from "./actions/user_actions";
import MobilePage from "./mobile.jsx";

const App = () => {
    const [initial, setInitial] = useState(true);
    const isLoggedIn = useSelector((state) => state.user.loggedIn);
    const dispatch = useDispatch();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get("fresh")) {
            window.location.href = "/loading";
            return;
        }

        if (!initial) return;

        try {
            const localCourses = window.localStorage.getItem("LocalCourses");
            if (!localCourses) return;

            const parsedCourses = JSON.parse(localCourses);
            if (Array.isArray(parsedCourses)) {
                dispatch(LoadLocalCourses(parsedCourses)); // ✅ Use localStorage
            } else {
                throw new Error("Invalid course format");
            }
        } catch (error) {
            console.error("Error loading local courses:", error);
            window.localStorage.removeItem("LocalCourses");
        }
    }, [initial, dispatch]);

    useEffect(() => {
        if (initial && isLoggedIn) {
            setInitial(false);
        }
    }, [isLoggedIn, initial]);

    // return window.screen.width >= 640 ? (
    return(
        <div className="App">
            <ToastContainer
                position="top-right"
                autoClose={1500}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                theme="light"
            />
            <Router>
                <Routes>
                    <Route path="/loading" element={<LoadingPage />} />
                    <Route element={<PrivateRoutes />}>
                        <Route element={<Dashboard />} path="dashboard" exact />
                        <Route element={<ProfilePage />} path="profile" exact />
                    </Route>
                    <Route element={<BrowseScreen />} path="browse">
                        <Route element={<BrowseScreen />} path=":code">
                            <Route element={<BrowseScreen />} path=":folderId" />
                        </Route>
                    </Route>
                    <Route element={<LandingPage />} path="/" />
                    <Route element={<ErrorScreen />} path="*" />
                </Routes>
            </Router>
        </div>
    // ) : (
    //     <MobilePage></MobilePage> //for mobile view
    );
};

export default App;
