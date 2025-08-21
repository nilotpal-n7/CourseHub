import "./styles.scss";
import React, { useState } from "react";
import { formatFileName, formatFileSize, formatFileType } from "../../../../utils/formatFile";
import { AddToFavourites } from "../../../../api/User";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { UpdateFavourites } from "../../../../actions/user_actions";
import { getCourse } from "../../../../api/Course.js";
import {
    RefreshCurrentFolder,
    UpdateCourses,
    ChangeCurrentYearData,
} from "../../../../actions/filebrowser_actions.js";
import { downloadFile, previewFile, getThumbnail } from "../../../../api/File";
import clientRoot from "../../../../api/server";
import capitalise from "../../../../utils/capitalise.js";
import Share from "../../../share";
import { verifyFile, unverifyFile } from "../../../../api/File";
import {
    RemoveFileFromFolder,
    UpdateFileVerificationStatus,
} from "../../../../actions/filebrowser_actions.js";
import ConfirmDialog from "./components/ConfirmDialog.jsx";
import { getFileDownloadLink } from "../../../../api/File";
import server from "../../../../api/server.js";

const FileDisplay = ({ file, path, code, isMobileView = false }) => {
    const user = useSelector((state) => state.user?.user);
    const currYear = useSelector((state) => state.fileBrowser.currentYear);
    const fileSize = formatFileSize(file.size);
    const fileType = formatFileType(file.name);
    const [showDialog, setShowDialog] = useState(false);
    const [dialogType, setDialogType] = useState("verify");
    const [onConfirmAction, setOnConfirmAction] = useState(() => () => {});

    let name = file.name;
    let _dispName = formatFileName(name);
    let contributor = file.name;
    try {
        if (name.indexOf("~") !== -1) {
            _dispName = formatFileName(name.slice(0, name.indexOf("~")));
            contributor = name.slice(name.indexOf("~") + 1);
            contributor = contributor.slice(0, contributor.indexOf("."));
        } else {
            _dispName = formatFileName(name.slice(0, name.indexOf(fileType)));
            contributor = "Anonymous";
        }
    } catch (error) {
        name = formatFileName(file.name);
        contributor = "Anonymous";
    }
    const isLoggedIn = useSelector((state) => state.user?.loggedIn);
    const currCourseCode = useSelector((state) => state.fileBrowser?.currentCourseCode);
    const currFolderId = useSelector((state) => state.fileBrowser?.currentFolder?._id);
    const currentUser = useSelector((state) => state.user.user);
    const isReadOnlyCourse = currentUser?.readOnly?.some(
        (c) => c.code.toLowerCase() === currCourseCode?.toLowerCase()
    );

    if (!file.isVerified && !currentUser?.isBR) {
        return null;
    }
    const dispatch = useDispatch();

    const preview_url = file.webUrl;
    const handleShare = () => {
        const sectionShare = document.getElementById("share");
        sectionShare.classList.add("show");
    };

    const handleDownload = async () => {
        if (!isLoggedIn) {
            toast.error("Please login to download.");
            return;
        }

        const downloadLink = await getFileDownloadLink(file.webUrl);

        if (!downloadLink) {
            toast.error("Failed to generate download link.");
            return;
        }

        //download file using downloadLink
        const a = document.createElement("a");
        a.href = downloadLink;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success("Downloading file...");
        // window.open(file.downloadUrl);
        //     const openedWindow = window.open("", "_blank");
        //     openedWindow.document.write("Please close this window after download starts.");
        //     const existingUrl = urls.downloadUrls.find((data) => data.id === file.id);
        //     if (existingUrl) {
        //         openedWindow.location.href = existingUrl.url;
        //         return;
        //     }
        //     const response = donwloadFile(file.id);
        //     toast.promise(response, {
        //         pending: "Generating download link...",
        //         success: "Downloading file....",
        //         error: "Something went wrong!",
        //     });
        //     response
        //         .then((data) => {
        //             dispatch(AddDownloadUrl(file.id, data.url));
        //             openedWindow.location.href = data.url;
        //         })
        //         .catch(() => {
        //             openedWindow.close();
        //         });
    };

    const handlePreview = async () => {
        if (!isLoggedIn) {
            toast.error("Please login to preview file.");
            return;
        }
        window.open(preview_url, "_blank");
    };

    const handleAddToFavourites = async () => {
        const resp = await AddToFavourites(file.id, file.name, path, code);
        if (resp?.data?.favourites) {
            dispatch(UpdateFavourites(resp?.data?.favourites));
        }
    };
    const handleVerify = async () => {
        //   const confirmAction = window.confirm("Are you sure you want to verify this file?");
        //   if (!confirmAction) return;
        setDialogType("verify");
        setOnConfirmAction(() => async () => {
            try {
                console.log("Verifying file:", file._id);
                await verifyFile(file._id);
                toast.success("File verified!");
                dispatch(UpdateFileVerificationStatus(file._id, true));

                // Instead of reload:
                const { data } = await getCourse(currCourseCode);
                dispatch(UpdateCourses(data));
                dispatch(ChangeCurrentYearData(currYear, data.children[currYear].children));
                dispatch(RefreshCurrentFolder());
            } catch (err) {
                console.error("Error verifying:", err);
                toast.error("Failed to verify file.");
            } finally {
                setShowDialog(false);
            }
        });
        setShowDialog(true);
    };

    const handleUnverify = () => {
        //   const confirmAction = window.confirm("Are you sure you want to permanently delete this file?");
        //   if (!confirmAction) return;
        setDialogType("delete");
        setOnConfirmAction(() => async () => {
            try {
                //console.log("Deleting file:", file._id);
                await unverifyFile(file._id, file.fileId, currFolderId);
                toast.success("File deleted!");
                // window.location.reload();
                dispatch(RemoveFileFromFolder(file._id, true));
                // fetchCourseDataAgain(currCourseCode);
                const { data } = await getCourse(currCourseCode);
                dispatch(UpdateCourses(data));
                dispatch(ChangeCurrentYearData(currYear, data.children[currYear].children));
                dispatch(RefreshCurrentFolder());
            } catch (err) {
                console.error("Error deleting:", err);
                toast.error("Failed to delete file.");
            } finally {
                setShowDialog(false);
            }
        });
        setShowDialog(true);
    };

    return (
        <div
            className={`file-display ${
                user?.isBR ? (file.isVerified ? "verified" : "unverified") : ""
            }`}
        >
            <img
                src={file.thumbnail}
                style={{ display: "none" }}
                onError={() => {
                    async function thumbnailrefresh() {
                        await getThumbnail(file.fileId);
                        const currCourse = await getCourse(code);
                        const { data } = currCourse;
                        dispatch(UpdateCourses(data));
                        dispatch(ChangeCurrentYearData(currYear, data.children[currYear].children));
                        dispatch(RefreshCurrentFolder());
                    }
                    thumbnailrefresh();
                }}
            />
            <div
                className="img-preview"
                style={{
                    background: `url(${file.thumbnail}) center/cover no-repeat`,
                }}
            >
                <div className="top">
                    {!isMobileView && user?.isBR && !isReadOnlyCourse && (
                        <>
                            {!file.isVerified ? (
                                <span
                                    className="verify"
                                    onClick={handleVerify}
                                    title="Verify"
                                ></span>
                            ) : (
                                <></>
                            )}
                            <span
                                className="unverify"
                                onClick={handleUnverify}
                                title="Delete"
                            ></span>
                        </>
                    )}
                    {/* <span className="share" onClick={handleShare}></span> */}

                    <span className="download" onClick={handleDownload}></span>
                    {/* <span
                        className="star"
                        onClick={() => {
                            handleAddToFavourites();
                            toast("Added to favourites.");
                        }}
                    ></span> */}
                </div>
                <div className="view" onClick={handlePreview} title={file.name}>
                    View
                </div>
            </div>
            <div className="content">
                <p className="title" title={file.name}>
                    {file?.name ? _dispName : "Quiz 1 Answer Key"}
                </p>
                <div className="file-metadata">
                    <p className="info">
                        {fileType.toUpperCase()} {fileSize}
                    </p>
                    <p className="contributor">{capitalise(contributor)}</p>
                </div>
            </div>
            <Share link={`${clientRoot}/browse/${currCourseCode.toLowerCase()}/${currFolderId}`} />
            {!isMobileView && (
                <ConfirmDialog
                    isOpen={showDialog}
                    type={dialogType}
                    onConfirm={onConfirmAction}
                    onCancel={() => setShowDialog(false)}
                />
            )}
        </div>
    );
};

export default FileDisplay;
