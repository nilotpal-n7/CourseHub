import "./styles.scss";
import { toast } from "react-toastify";
import { CopyToClipboard } from "react-copy-to-clipboard";
import clientRoot from "../../../../api/server";
import Share from "../../../share";
import { useState } from "react";
import { createFolder } from "../../../../api/Folder";
import { getCourse } from "../../../../api/Course";
import {
    ChangeCurrentCourse,
    ChangeCurrentYearData,
    ChangeFolder,
    UpdateCourses,
} from "../../../../actions/filebrowser_actions";
import { AddNewCourseLocal } from "../../../../actions/user_actions";
import { useDispatch, useSelector } from "react-redux";
import { RefreshCurrentFolder } from "../../../../actions/filebrowser_actions";
import { ConfirmDialog } from "./confirmDialog";
import server from "../../../../api/server";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { fetchFolder } from "../../../../api/Folder";

/**
 * Merges the contents of a childZip into a mainZip, placing them inside a folder.
 * @param {JSZip} mainZip The root zip object.
 * @param {JSZip} childZip The zip object to merge.
 * @param {string} folderName The name of the folder to create in mainZip.
 */
async function mergeZip(mainZip, childZip, folderName) {
    const promises = [];
    childZip.forEach((relativePath, file) => {
        if (!file.dir) {
            promises.push(
                file.async("blob").then((content) => {
                    // Add file to main zip under the new folder name
                    mainZip.file(`${folderName}/${relativePath}`, content);
                })
            );
        } else {
            // Ensure nested folder structure is created
            mainZip.folder(`${folderName}/${relativePath}`);
        }
    });
    await Promise.all(promises);
}

const FolderInfo = ({
    isBR,
    path,
    name,
    canDownload,
    contributionHandler,
    folderId,
    courseCode,
    isMobileView = false,
    selectedFolderData = [],
    selectedFileData = [],
}) => {
    const dispatch = useDispatch();
    const currYear = useSelector((state) => state.fileBrowser.currentYear);
    const currentData = useSelector((state) => state.fileBrowser.currentData);
    const [showConfirm, setShowConfirm] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    const [childType, setChildType] = useState("File");
    const [isAdding, setIsAdding] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    const user = useSelector((state) => state.user.user);
    const isReadOnlyCourse = user?.readOnly?.some(
        (c) => c.code.toLowerCase() === courseCode?.toLowerCase()
    );

    const handleShare = () => {
        const sectionShare = document.getElementById("share");
        sectionShare.classList.add("show");
    };

    const handleCreateFolder = () => {
        setNewFolderName("");
        setChildType("File");
        setShowConfirm(true);
    };

    const handleConfirmCreateFolder = async () => {
        if (isAdding) return;
        setIsAdding(true);
        const folderName = newFolderName.trim();
        if (!folderName?.trim() || !childType) {
            setIsAdding(false);
            return;
        }

        if (
            currentData &&
            currentData.some((item) => item.name.toLowerCase() === folderName.toLowerCase())
        ) {
            toast.error(`A file or folder named "${folderName}" already exists.`);
            setIsAdding(false);
            return;
        }

        if (!courseCode || !folderId) {
            toast.error("No course selected.");
            setIsAdding(false);
            return;
        }

        try {
            const res = await getCourse(courseCode);
            if (!res.data?.found) {
                toast.error("Course not found. Cannot create folder.");
                setIsAdding(false);
                return;
            }

            await createFolder({
                name: folderName.trim(),
                course: courseCode,
                parentFolder: folderId,
                childType: childType,
            });
            const { data } = await getCourse(courseCode);

            dispatch(UpdateCourses(data));
            dispatch(ChangeCurrentYearData(currYear, data.children[currYear].children));
            dispatch(RefreshCurrentFolder());
            toast.success(`Folder "${folderName}" created`);
        } catch (error) {
            // console.log(error);
            toast.error("Failed to create folder.");
        }
        setShowConfirm(false);
        setIsAdding(false);
    };

    const fetchAndZipFile = async (file, zip) => {
        try {
            // 1. Call a NEW "proxy" endpoint on your backend
            const fileResponse = await fetch(`${server}/api/files/download-proxy`, { // <-- NEW ENDPOINT
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: file.webUrl }), // Send the SharePoint URL
            });

            if (!fileResponse.ok) {
                throw new Error(`Failed to proxy file: ${file.name}`);
            }

            // 2. The response *is* the file blob itself, not JSON
            const fileBlob = await fileResponse.blob(); 
            
            // 3. Add the blob directly to the zip
            zip.file(file.name, fileBlob);

        } catch (error) {
            console.error(`Error downloading file ${file.name}:`, error);
            toast.error(`Failed to download file: ${file.name}`);
        }
    };

    const downloadFolderRecursive = async (id) => {
        try {
            const data = await fetchFolder(id);
            const zip = new JSZip();
            const childType = data.childType || "File"; // Default to "File"

            for (const child of data.children) {
                if (childType === "Folder") {
                    // Recursive case: child is a folder
                    const childZip = await downloadFolderRecursive(child._id);
                    // Merge the child zip into the main zip under its folder name
                    await mergeZip(zip, childZip, child.name);
                } else {
                    await fetchAndZipFile(child, zip);
                }
            }
            return zip;
        } catch (error) {
            console.error(`Error downloading folder content:`, error);
            toast.error("Failed to download folder content.");
            return null;
        }
    };

    // Usage function remains the same
    const downloadAndSaveFolder = async (currentFolderId, currentFolderName) => {
        if (isDownloading) return;

        let toastId;
        try {
            setIsDownloading(true);
            toastId = toast.info("Preparing to download...", {
                autoClose: false,
                closeOnClick: false,
                closeButton: false,
                draggable: false,
            });

            let zipToSave;
            let zipFileName;
            const totalSelected = selectedFolderData.length + selectedFileData.length;

            // --- CHECK FOR SELECTED ITEMS ---
            if (totalSelected > 0) {
                // CASE 1: Download selected items
                toast.update(toastId, {
                    render: `Zipping ${totalSelected} selected items...`,
                });
                
                const rootZip = new JSZip();
                
                // Create zip name as requested
                const timestamp = new Date().toISOString().replace(/:/g, '-').slice(0, 19);
                // Use the `path` prop (parent dir) for the name
                const safePath = path.replace(/[\/\\ >]/g, '_') || 'selection';
                zipFileName = `coursehub-${safePath}-selected-${timestamp}.zip`;

                for (const folder of selectedFolderData) {
                    // Download each selected folder recursively
                    const itemZip = await downloadFolderRecursive(folder._id);
                    if (itemZip) {
                        // Merge it into the root zip under its own name
                        await mergeZip(rootZip, itemZip, folder.name);
                    }
                }

                for (const file of selectedFileData) {
                    await fetchAndZipFile(file, rootZip);
                }
                zipToSave = rootZip;

            } else {
                // CASE 2: No selection, download the current folder (default behavior)
                toast.update(toastId, { render: "Zipping current folder..." });
                zipToSave = await downloadFolderRecursive(currentFolderId);
                zipFileName = `${currentFolderName}.zip`;
            }

            if (!zipToSave) {
                throw new Error("Failed to create folder archive.");
            }

            // Generate and save the final ZIP
            const zipBlob = await zipToSave.generateAsync({
                type: "blob",
                compression: "DEFLATE",
                compressionOptions: { level: 6 },
            });

            saveAs(zipBlob, zipFileName);

            toast.dismiss(toastId);
            toast.success("Download ready!");
        } catch (error) {
            console.error("Error in downloadAndSaveFolder:", error);
            if (toastId) toast.dismiss(toastId);
            toast.error("Failed to download folder.");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <>
            <div className="folder-info">
                <div className="info">
                    <p className="path">{path}</p>
                    <div className="curr-folder">
                        <p className="folder-name">{name}</p>
                        <div className="folder-actions">
                            {folderId && courseCode && (
                                <>
                                    {/* Uncomment these if you want to add them back */}
                                    {/* <span
                                    className="folder-action-icon favs"
                                    onClick={() => {
                                        toast("Added to favourites.");
                                    }}
                                ></span>
                                <span
                                    className="folder-action-icon share"
                                    onClick={handleShare}
                                ></span> */}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Consolidated actions container - Hidden for mobile view */}
                {!isMobileView && (
                    <div className="main-actions">
                        {/* Download button - always visible */}
                        <button
                            className="btn download"
                            onClick={() => downloadAndSaveFolder(folderId, name)}
                            title="Download entire folder as ZIP"
                            disabled={isDownloading}
                        >
                            <span className="icon download-icon"></span>
                            <span className="text">
                                {isDownloading
                                    ? "Zipping..."
                                    : (selectedFolderData.length + selectedFileData.length) > 0
                                    ? `Download (${selectedFolderData.length + selectedFileData.length})`
                                    : "Download"}
                            </span>
                        </button>

                        {/* Conditional action buttons */}
                        {!isReadOnlyCourse && canDownload && (
                            <button className="btn primary" onClick={contributionHandler}>
                                <span className="icon plus-icon"></span>
                                <span className="text">{isBR ? "Add File" : "Contribute"}</span>
                            </button>
                        )}

                        {!isReadOnlyCourse && isBR && !canDownload && (
                            <button
                                className="btn primary"
                                onClick={handleCreateFolder}
                                disabled={isAdding}
                            >
                                <span className="icon plus-icon"></span>
                                <span className="text">
                                    {isAdding ? "Creating..." : "Add Folder"}
                                </span>
                            </button>
                        )}
                    </div>
                )}
            </div>

            <Share link={`${clientRoot}/browse/${courseCode}/${folderId}`} />
            {!isMobileView && (
                <ConfirmDialog
                    show={showConfirm}
                    input={true}
                    inputValue={newFolderName}
                    onInputChange={(e) => setNewFolderName(e.target.value)}
                    childType={childType}
                    onChildTypeChange={setChildType}
                    onConfirm={handleConfirmCreateFolder}
                    onCancel={() => setShowConfirm(false)}
                />
            )}
        </>
    );
};

export default FolderInfo;
