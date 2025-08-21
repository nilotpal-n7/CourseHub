import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "./api/User";
import { fetchUserCoursesData } from "./api/Course";
import { toast } from "react-toastify";
import "./loading.css";
import { LoginUser } from "./actions/user_actions";
import { useDispatch } from "react-redux";

const LoadingPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadData() {
            try {
                const { data: user } = await getUser();
                if (!user || !user.rollNumber) {
                    setError("Invalid user data.");
                    return navigate("/login");
                }

                // console.log("here in loading");
                const { courses, previousCourses } = await fetchUserCoursesData(user);

                user.courses = courses;
                user.previousCourses = previousCourses;

                dispatch(LoginUser(user));
                navigate("/dashboard");
            } catch (err) {
                console.error("Loading error:", err);
                toast.error("Failed to load user data.");
                setError("Failed to load user data.");
                navigate("/login");
            }
        }

        loadData();
    }, [dispatch, navigate]);

    return (
        <div
            className="!flex !flex-col !items-center !justify-center !h-screen !w-screen !bg-black !text-white"
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
                width: "100vw",
                backgroundColor: "black",
                color: "white",
            }}
        >
            <div className="flex justify-center items-center relative">
                <div className="jimu-primary-loading"></div>
            </div>
            <div className="mt-10 text-center">
                <h2>Fetching your courses</h2>
            </div>
        </div>
    );
};

export default LoadingPage;
