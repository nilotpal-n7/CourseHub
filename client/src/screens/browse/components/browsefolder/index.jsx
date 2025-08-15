import "./styles.scss";
import React, { useState, useRef } from "react";
import { useSelector } from "react-redux";
import { getCourse } from "../../../../api/Course";
import { useDispatch } from "react-redux";
import { ChangeFolder } from "../../../../actions/filebrowser_actions";
import { deleteFolder } from "../../../../api/Folder";
import { toast } from "react-toastify";
import { RefreshCurrentFolder, UpdateCourses, ChangeCurrentYearData } from "../../../../actions/filebrowser_actions";
import { ConfirmDialog } from "./confirmDialog";
import { FolderRename } from "./folderRename.jsx";
const BrowseFolder = ({ type = "file", color, path, name, subject, folderData, parentFolder }) => {
    const dispatch = useDispatch();
    const currYear = useSelector((state) => state.fileBrowser.currentYear);
    const isBR = useSelector((state) => state.user.user.isBR);
    const [showConfirm, setShowConfirm] = useState(false);
    const user = useSelector((state) => state.user.user);
    const courseCode = subject || folderData?.course;
    const isReadOnlyCourse = user?.readOnly?.some(
        (c) => c.code.toLowerCase() === courseCode?.toLowerCase()
    );

    const [isEditing, setIsEditing] = useState(false);
    const renameRef = useRef();

    const onClick = (folderData) => {
        // return;
        dispatch(ChangeFolder(folderData));
    };

    const handleDelete = async (e) => {
        try {
            await deleteFolder({ folder: folderData, parentFolderId: parentFolder._id });
            toast.success("Folder deleted successfully!");
            const { data } = await getCourse(folderData?.course);
            dispatch(RefreshCurrentFolder());
            dispatch(UpdateCourses(data));
            dispatch(ChangeCurrentYearData(currYear, data.children[currYear].children));
        } catch (err) {
            console.log(err);
            toast.error("Failed to delete folder.");
        }
        setShowConfirm(false);
    };

    const cancelDelete = () => {
        setShowConfirm(false);
    };

    return (
        <>
            <div className="browse-folder" onClick={() => onClick(folderData)}>
                {/* {type === "folder" ? (
                <svg
                    width="200"
                    height="175"
                    viewBox="0 0 237 187"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M0.200195 186.4V0.400024H105.924L121.027 15.5034H197.857L212.96 0.400024H236.6V186.4H0.200195Z"
                        fill={color ? color : "#fece6fb3"}
                    />
                    <path
                        d="M205.4 8.20007H114.2L121.4 16.0001H198.8L205.4 8.20007Z"
                        fill="#EBEBEB"
                    />
                </svg>
            ) : (
                <svg
                    width="200"
                    height="175"
                    viewBox="0 0 238 187"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M0.800293 186.4V0.400024H200.6L237.2 37.2377V186.4H0.800293Z"
                        fill={color ? color : "#f3f0da"}
                    />
                    <path d="M200.6 1L236.6 37H200.6V1Z" fill={"#CDCDCD"} fillOpacity="0.5" />
                    <line
                        x1="18.2002"
                        y1="65.8"
                        x2="223.4"
                        y2="65.8"
                        stroke="black"
                        strokeOpacity="0.25"
                        strokeWidth="1.2"
                    />
                    <line
                        x1="18.2002"
                        y1="95.8"
                        x2="223.4"
                        y2="95.8"
                        stroke="black"
                        strokeOpacity="0.25"
                        strokeWidth="1.2"
                    />
                    <line
                        x1="18.2002"
                        y1="123.4"
                        x2="224.6"
                        y2="123.4"
                        stroke="black"
                        strokeOpacity="0.25"
                        strokeWidth="1.2"
                    />
                    <line
                        x1="18.2002"
                        y1="151"
                        x2="224.6"
                        y2="151"
                        stroke="black"
                        strokeOpacity="0.25"
                        strokeWidth="1.2"
                    />
                    <line
                        x1="18.2002"
                        y1="178.6"
                        x2="224.6"
                        y2="178.6"
                        stroke="black"
                        strokeOpacity="0.25"
                        strokeWidth="1.2"
                    />
                </svg>
            )} */}
                <div className="content">
                    <div className="top">
                        <p className="path">{""}</p>
                        {!isEditing ? (
                            <span className="name">
                                {name ? name : "Name"}
                                {isBR && !isReadOnlyCourse && (
                                    <div
                                        className="rename-tick"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsEditing(true);
                                        }}
                                    ></div>
                                )}
                            </span>
                        ) : (
                            <FolderRename
                                initialName={name}
                                onCancel={() => setIsEditing(false)}
                                onSave={(newName) => { 
                                    console.log(newName);
                                    setIsEditing(false); 
                                }}
                            />
                        )}
                        {isBR && !isReadOnlyCourse && (
                            <span
                                className="delete"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowConfirm(true);
                                }}
                                title="Delete folder"
                            ></span>
                        )}
                    </div>
                    <div className="bottom">
                        <p className="subject">
                            {subject ? subject.toUpperCase() : "Subject Here"}
                        </p>
                    </div>
                </div>
            </div>
            {isBR && !isReadOnlyCourse && (
                <ConfirmDialog
                    isOpen={showConfirm}
                    type="delete"
                    onConfirm={handleDelete}
                    onCancel={cancelDelete}
                />
            )}
        </>
    );
};

export default BrowseFolder;
