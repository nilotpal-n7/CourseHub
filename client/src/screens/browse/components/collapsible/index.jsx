import { useState } from "react";
import Folder from "./components/folder";
import FolderController from "./components/folder-controller";
import "./styles.scss";
import { useSelector, useDispatch } from "react-redux";
import {
    ChangeCurrentYearData,
    UpdateCourses,
    ChangeCurrentCourse,
} from "../../../../actions/filebrowser_actions";
import {
    ChangeFolder,
    PushFolderHistory,
    ClearFolderHistory,
} from "../../../../actions/filebrowser_actions";
import { getCourse } from "../../../../api/Course";
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SmallLoader from "../../../../components/SmallLoader";
import searchFolderById from "../../../../utils/searchFolderById";
import { toast } from "react-toastify";
import { capitalise } from "../../../../utils/capitalise";

const Collapsible = ({ course, color, state }) => {
    const [open, setOpen] = useState(state ? state : false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [initial, setInitial] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const folderData = useSelector((state) => state.fileBrowser.currentYearFolderStructure);
    const currCourseCode = useSelector((state) => state.fileBrowser.currentCourseCode);
    const currentYear = useSelector((state) => state.fileBrowser.currentYear);
    const currentCourse = useSelector((state) => state.fileBrowser.currentCourse);
    const allCourseData = useSelector((state) => state.fileBrowser.allCourseData);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const onClick = () => {
        if (!open) triggerGetCourse();
        else dispatch(ChangeCurrentYearData(null, []));
        setOpen(!open);
    };

    const getCurrentCourse = async (code) => {
        dispatch(ChangeCurrentYearData(null, [])); // Clear folderData till next folderData is loaded
        setLoading(true);
        let currCourse = null;
        let insessionStorage = null;
        try {
            const allLocal = JSON.parse(sessionStorage.getItem("AllCourses"));
            insessionStorage = allLocal?.find(
                (course) => course.code.toLowerCase() === code.toLowerCase().replaceAll(" ", "")
            );
        } catch (error) {
            sessionStorage.removeItem("AllCourses");
            location.reload();
        }
        try {
            currCourse = allCourseData.find(
                (course) => course.code.toLowerCase() === code.toLowerCase().replaceAll(" ", "")
            );
        } catch (error) {
            sessionStorage.removeItem("AllCourses");
            location.reload();
        }
        if (currCourse || insessionStorage) {
            // console.log("Already present...");
        }
        // console.log(currCourse);
        if (!currCourse) {
            try {
                let loadingCourseToastId = toast.loading("Loading course data...");
                currCourse = await getCourse(code.replaceAll(" ", ""));
                // console.log("req");
                const { data } = currCourse;
                if (!data.found) {
                    setError(false);
                    setNotFound(true);
                    setLoading(false);
                    toast.dismiss(loadingCourseToastId);
                    toast.error("Course data not found!");
                    return;
                }
                toast.dismiss(loadingCourseToastId);
                setNotFound(false);
                let temp = currCourse;
                currCourse = temp.data;
            } catch (error) {
                setLoading(false);
                setError(true);
                return null;
            }
            if (!allCourseData.find((course) => course.code === code)) {
                dispatch(UpdateCourses(currCourse));
            }
        }
        setLoading(false);
        dispatch(ChangeFolder(null));
        return currCourse;
    };
    const triggerGetCourse = () => {
        const run = async () => {
            try {
                const fetched = await getCurrentCourse(course.code);
                if (!fetched) {
                    toast.error("Course data could not be loaded.");
                    return;
                }

                const courseCode = course.code.replaceAll(" ", "").toUpperCase();

                dispatch(ChangeCurrentCourse(fetched.children, fetched.code));

                // Navigate to the course URL (consistent with mobile dropdown)
                navigate(`/browse/${courseCode}`);

                const yearIndex = fetched.children.length - 1;
                const yearFolder = fetched.children?.[yearIndex];

                if (!yearFolder) {
                    //toast.warn("No folders available for this course.");
                    dispatch(ChangeCurrentYearData(yearIndex, []));
                    dispatch(ChangeFolder(null));
                    return;
                }

                const yearChildren = Array.isArray(yearFolder.children) ? yearFolder.children : [];

                dispatch(ChangeCurrentYearData(yearIndex, yearChildren));
                dispatch(ClearFolderHistory()); // Clear history when selecting a new course from collapsible
                dispatch(ChangeFolder(yearFolder));

                setInitial(false);
            } catch (error) {
                console.error(error);
                toast.error("Something went wrong while loading the course.");
            }
        };

        run();
    };

    let courseCode = course.code.replaceAll(" ", "");
    useEffect(() => {
        // console.log(currCourseCode);
        // console.log(course);
        if (currCourseCode?.toLowerCase() !== courseCode?.toLowerCase()) {
            setOpen(false);
        }
        if (currCourseCode?.toLowerCase() === courseCode?.toLowerCase()) {
            //// console.log("called");
            triggerGetCourse();
            setOpen(true);
        }
        //setInitial(true);
    }, [currCourseCode]);

    useEffect(() => {
        if (currCourseCode?.toLowerCase() === courseCode?.toLowerCase()) {
            setInitial(false);
        }
    }, [currentYear]);

    let { code, folderId } = useParams();

    useEffect(() => {
        if (initial) return;
        if (code && folderId && code?.toLowerCase() === courseCode?.toLowerCase()) {
            // console.log(course);
            try {
                let searchedFolder = searchFolderById(currentCourse, folderId);
                // console.log("searched folder", searchedFolder);
                if (searchedFolder) {
                    dispatch(ChangeFolder(searchedFolder));
                }
            } catch (error) {
                // console.log(error);
            }
        }
    }, [initial, currentCourse]);

    return (
        <div className={`collapsible ${open}`}>
            <div className="main" onClick={onClick}>
                <div className="color" style={{ backgroundColor: color ? color : "#6F8FFE" }}></div>
                <div className="content">
                    <div className="text">
                        <p className="code">{course.code ? course.code.toUpperCase() : "CL 301"}</p>
                        <p className="name">
                            {course.name ? capitalise(course.name) : "Name Unavailable"}
                        </p>
                    </div>
                    <div className="arrow"></div>
                </div>
            </div>
            <div className="collapsible-content">
                {loading && <SmallLoader text="Loading course..." />}
                {error && "error"}
                {notFound && "course not added yet"}
                {!loading &&
                    !error &&
                    !notFound &&
                    currCourseCode?.toLowerCase() ===
                        course.code.replaceAll(" ", "").toLowerCase() && (
                        <FolderController folders={folderData} />
                    )}
            </div>
        </div>
    );
};

export default Collapsible;
