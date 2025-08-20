import "./styles.scss";
import Container from "../../components/container";
import Collapsible from "./components/collapsible";
import Navbar from "../../components/navbar";
import FolderInfo from "./components/folder-info";
import FileDisplay from "./components/file-display";
import BrowseFolder from "./components/browsefolder";
import { useSelector, useDispatch } from "react-redux";
import NavBarBrowseScreen from "./components/navbar";
import Contributions from "../contributions";
import { useEffect, useState } from "react";
import {
    ChangeCurrentCourse,
    ChangeCurrentYearData,
    ChangeFolder,
    LoadCourses,
    UpdateCourses,
} from "../../actions/filebrowser_actions";
import { getColors } from "../../utils/colors";
import { AddNewCourseLocal, LoginUser, LogoutUser } from "../../actions/user_actions";
import { getUser } from "../../api/User";
import { useParams } from "react-router-dom";
import { getCourse } from "../../api/Course";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Share from "../share";
import FileController from "./components/collapsible/components/file-controller";
import YearInfo from "./components/year-info";
const BrowseScreen = () => {
    const navigate = useNavigate();
    const user = useSelector((state) => state.user);
    const folderData = useSelector((state) => state.fileBrowser.currentFolder);
    const refreshKey = useSelector((state) => state.fileBrowser.refreshKey);
    const currCourse = useSelector((state) => state.fileBrowser.currentCourse);
    const currCourseCode = useSelector((state) => state.fileBrowser.currentCourseCode);
    const currYear = useSelector((state) => state.fileBrowser.currentYear);
    const allCourseData = useSelector((state) => state.fileBrowser.allCourseData);

    const sortFile = (a, b) => {
        if (a?.name > b?.name) return 1;
        else if(a?.name < b?.name) return -1;
        else return 1;
    }

    if(folderData?.childType == "File" && folderData?.children?.length > 1) folderData?.children.sort(sortFile);

    const contributionHandler = (event) => {
        const collection = document.getElementsByClassName("contri");
        const contributionSection = collection[0];
        contributionSection.classList.add("show");
    };
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);
    const { code, folderId } = useParams();
    const fb = useSelector((state) => state.fileBrowser);
    useEffect(() => {
        sessionStorage.removeItem("AllCourses");
    }, []);
    useEffect(() => {
        if (sessionStorage.getItem("AllCourses") !== null) {
            try {
                dispatch(LoadCourses(JSON.parse(sessionStorage.getItem("AllCourses"))));
            } catch (error) {
                dispatch(LoadCourses([]));
                // console.log("load error");
            }
        }
    }, []);

    useEffect(() => {
        async function getAuth() {
            try {
                const { data } = await getUser();
                if (!data) {
                    dispatch(LogoutUser());
                    setLoading(false);
                    return;
                }
                dispatch(LoginUser(data));
                setLoading(false);
            } catch (error) {
                dispatch(LogoutUser());
                console.log("in index.js error loading");
                setLoading(false);
                navigate("/login");
            }
        }

        if (!user?.loggedIn) getAuth();
    }, []);

    useEffect(() => {
        if (loading || !code) return;
        const run = async () => {
            let sessionStorageCourses = null;
            let fetchedData = null;

            try {
                sessionStorageCourses = JSON.parse(sessionStorage.getItem("AllCourses"));
            } catch (error) {
                sessionStorageCourses = null;
            }

            let currCourse = null;
            try {
                currCourse = allCourseData?.find(
                    (course) => course.code?.toLowerCase() === code?.toLowerCase()
                );
            } catch (error) {
                sessionStorage.removeItem("AllCourses");
                location.reload();
            }
            const present = sessionStorageCourses?.find(
                (course) => course.code?.toLowerCase() === code.toLowerCase()
            );
            let root = [];
            if (present || currCourse) {
                // console.log("found in sessionStorage");
                fetchedData = present;
                // console.log(fetchedData);
                root = fetchedData;
                dispatch(AddNewCourseLocal(fetchedData));
            } else {
                let fetchingToast = toast.loading("Loading course data...");
                fetchedData = await getCourse(code.toUpperCase());
                if (fetchedData.data.found) {
                    toast.dismiss(fetchingToast);
                    dispatch(ChangeCurrentCourse(null, code.toUpperCase()));
                    navigate("/browse");
                    // dispatch(UpdateCourses(fetchedData.data));
                    // dispatch(AddNewCourseLocal(fetchedData.data));
                    root = fetchedData.data;
                } else {
                    toast.dismiss(fetchingToast);
                    toast.error("Course not found!");
                }
            }
            dispatch(ChangeCurrentCourse(null, code));
        };
        run();

        // console.log("code search");
    }, [loading, code]);
    // console.log("folderData?.children: ", folderData?.children);

    // useEffect(() => {
    // console.log(fb);
    // console.log(user);
    // }, [fb, user]);

    // const fetchCourseDataAgain = async (courseCode) => {
    // try {
    //     const courseCode = currCourseCode ;
    //     const fetchedData = await getCourse(courseCode.toLowerCase());
    //     if (fetchedData.data.found) {
    //     dispatch(UpdateCourses(fetchedData.data));
    //     dispatch(AddNewCourseLocal(fetchedData.data));
    //     } else {
    //     toast.error("Course not found!");
    //     }
    // } catch (error) {
    //     console.error("Error refetching course data:", error);
    // }
    // };

    useEffect(() => {
        const refreshFolderData = async () => {
            if (!folderData?._id || !currCourseCode) return;

            try {
                const res = await getCourse(currCourseCode);
                if (res.data?.found) {
                    const updatedFolder = findFolderById(res.data.children, folderData._id);
                    if (updatedFolder) {
                        dispatch(ChangeFolder(updatedFolder));
                    }
                }
            } catch (err) {
                toast.error("Could not refresh folder view.");
            }
        };

        refreshFolderData();
    }, [refreshKey]);

    const findFolderById = (folders, id) => {
        for (const folder of folders) {
            if (folder._id === id) return folder;
            if (folder.children?.length) {
                const result = findFolderById(folder.children, id);
                if (result) return result;
            }
        }
        return null;
    };

    const HeaderText =
        folderData?.childType === "File"
            ? "Select a file..."
            : folderData?.childType === "Folder"
            ? "Select a folder..."
            : currCourse
            ? "No data available for this course"
            : "Select a course...";

    return (
        <Container color={"light"} type={"fluid"}>
            <div className="navbar-browse-screen">
                <NavBarBrowseScreen />
            </div>
            <div className="controller">
                <div className="left">
                    <h4 className="heading">MY COURSES</h4>
                    {user.localCourses?.length > 0
                        ? ""
                        : user.user?.courses?.map((course, idx) => {
                              return (
                                  <Collapsible
                                      color={getColors(idx)}
                                      key={idx}
                                      course={course}
                                      isReadOnly={false}
                                  />
                              );
                          })}
                    {user.localCourses?.map((course, idx) => {
                        return <Collapsible color={course.color} key={idx} course={course} />;
                    })}

                    {user.user?.readOnly?.length > 0 && <h4 className="heading">OTHERS</h4>}

                    {user.user?.readOnly?.map((course, idx) => (
                        <Collapsible
                            color={course.color}
                            key={`readonly-${idx}`}
                            course={course}
                            isReadOnly={true}
                        />
                    ))}

                    {user.user?.isBR && <h4 className="heading">PREVIOUS COURSES</h4>}
                    {!(user.user?.isBR && user.user?.previousCourses?.length > 0)
                        ? ""
                        : `<h4 className="heading">PREVIOUS COURSES</h4>` &&
                          user.user?.previousCourses?.map((course, idx) => {
                              return (
                                  <Collapsible color={getColors(idx)} key={idx} course={course} />
                              );
                          })}
                </div>
                <div className="middle">
                    {folderData && (
                        <FolderInfo
                            isBR={user.user.isBR}
                            path={folderData?.path ? folderData.path : HeaderText}
                            name={folderData?.name ? folderData.name : HeaderText}
                            canDownload={folderData?.childType === "File"}
                            contributionHandler={contributionHandler}
                            folderId={folderData?._id}
                            courseCode={folderData?.course}
                        />
                    )}
                    <div className="files">
                        {!folderData ? (
                            <div className="empty-message">{HeaderText}</div>
                        ) : folderData?.childType === "File" ? (
                            folderData?.children?.length === 0 ? (
                                <p className="empty-message">No files available.</p>
                            ) : (
                                <FileController files={folderData?.children} code={currCourseCode}/>
                            )
                        ) : folderData?.children?.length === 0 ? (
                            <div className="empty-folder">
                                <p className="empty-message">No folders available.</p>
                            </div>
                        ) : (
                            folderData?.children.map((folder) => (
                                <BrowseFolder
                                    type="folder"
                                    key={folder._id}
                                    path={folder.path}
                                    name={folder.name}
                                    subject={folder.course}
                                    folderData={folder}
                                    parentFolder={folderData}
                                />
                            ))
                        )}

                        {/* // : folderData?.childType === "File"
                            //     ? folderData?.children?.map((file) => (
                            //         <FileDisplay
                            //             file={file}
                            //             key={file._id}
                            //             path={folderData?.path ? folderData.path : "root"}
                            //             code={currCourseCode}
                            //         />
                            //     ))
                            //     : folderData?.children.map((folder) => (
                            //         <BrowseFolder
                            //             type="folder"
                            //             key={folder._id}
                            //             path={folder.path}
                            //             name={folder.name}
                            //             subject={folder.course}
                            //             folderData={folder}
                            //         />
                            //     ))} */}
                    </div>
                </div>
                <div className="right">
                    <YearInfo
                        isBR={user.user.isBR}
                        courseCode={currCourseCode}
                        course={currCourse}
                        currYear={currYear}
                    />
                </div>
            </div>

            <Contributions />
        </Container>
    );
};

export default BrowseScreen;
