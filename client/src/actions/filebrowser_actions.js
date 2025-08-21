export const ChangeCurrentCourse = (courseData, courseCode) => {
    return {
        type: "CHANGE_CURRENT_COURSE",
        payload: {
            currentCourse: courseData,
            currentCourseCode: courseCode,
        },
    };
};
export const UpdateCourses = (course) => {
    return {
        type: "UPDATE_COURSES",
        payload: {
            currentCourse: course,
        },
    };
};

export const ChangeFolder = (folder) => {
    return {
        type: "CHANGE_CURRENT_FOLDER",
        payload: {
            currentFolder: folder,
        },
    };
};
export const LoadCourses = (data) => {
    return {
        type: "LOAD_COURSES",
        payload: {
            allCourseData: data,
        },
    };
};

export const ChangeCurrentYearData = (_currYear, _folderStructure) => {
    return {
        type: "CHANGE_CURRENT_YEAR_DATA",
        payload: {
            currentYear: _currYear,
            currentYearFolderStructure: _folderStructure,
        },
    };
};
export const ResetFileBrowserState = () => {
    return {
        type: "RESET_FILE_BROWSER_STATE",
    };
};
export const UpdateFileVerificationStatus = (fileId, status) => ({
    type: "UPDATE_FILE_VERIFICATION_STATUS",
    payload: { fileId, status },
});

export const RemoveFileFromFolder = (fileId) => ({
    type: "REMOVE_FILE_FROM_FOLDER",
    payload: fileId,
});

export const RefreshCurrentFolder = () => ({
    type: "REFRESH_CURRENT_FOLDER",
    payload: Date.now(),
});

export const PushFolderHistory = (folder) => ({
    type: "PUSH_FOLDER_HISTORY",
    payload: folder,
});

export const PopFolderHistory = () => ({
    type: "POP_FOLDER_HISTORY",
});

export const ClearFolderHistory = () => ({
    type: "CLEAR_FOLDER_HISTORY",
});
