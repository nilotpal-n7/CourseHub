const FileBrowserReducer = (
    state = {
        currentCourse: null,
        currentCourseCode: null,
        currentFolder: null,
        currentYear: null,
        currentYearFolderStructure: [],
        allCourseData: [],
        folderHistory: [], // Add folder navigation history
    },
    action
) => {
    switch (action.type) {
        case "LOAD_COURSES":
            return { ...state, allCourseData: action.payload.allCourseData };
        case "CHANGE_CURRENT_COURSE":
            // console.log("Changed Current Course");

            return {
                ...state,
                currentCourse: action.payload.currentCourse,
                currentCourseCode: action.payload.currentCourseCode,
            };
        case "UPDATE_COURSES":
            // console.log("Updated");
            let arr = Array.isArray(state.allCourseData) ? [...state.allCourseData] : [];
            if (
                arr.find(
                    (course) =>
                        course.code?.toLowerCase() ===
                        action.payload.currentCourse.code.toLowerCase()
                )
            ) {
                arr = arr.filter(
                    (course) =>
                        course.code?.toLowerCase() !==
                        action.payload.currentCourse.code.toLowerCase()
                );
            }
            arr.push(action.payload.currentCourse);
            sessionStorage.setItem("AllCourses", JSON.stringify(arr));
            return {
                ...state,
                allCourseData: [...arr],
            };
        case "CHANGE_CURRENT_FOLDER":
            return { ...state, currentFolder: action.payload.currentFolder };
        case "CHANGE_CURRENT_YEAR_DATA":
            return {
                ...state,
                currentYear: action.payload.currentYear,
                currentYearFolderStructure: [...action.payload.currentYearFolderStructure],
            };
        case "RESET_FILE_BROWSER_STATE":
            return {
                ...state,
                currentCourse: null,
                currentCourseCode: null,
                currentFolder: null,
                currentYear: null,
            };
        case "UPDATE_FILE_VERIFICATION_STATUS":
            return {
                ...state,
                currentFolder: {
                    ...state.currentFolder,
                    children: state.currentFolder.children.map((file) =>
                        file._id === action.payload.fileId
                            ? { ...file, isVerified: action.payload.status }
                            : file
                    ),
                },
            };
        case "REMOVE_FILE_FROM_FOLDER":
            return {
                ...state,
                currentFolder: {
                    ...state.currentFolder,
                    children: state.currentFolder.children.filter(
                        (file) => file._id !== action.payload
                    ),
                },
            };

        case "REFRESH_CURRENT_FOLDER":
            return {
                ...state,
                refreshKey: action.payload,
            };

        case "PUSH_FOLDER_HISTORY":
            return {
                ...state,
                folderHistory: [...state.folderHistory, action.payload],
            };

        case "POP_FOLDER_HISTORY":
            const newHistory = [...state.folderHistory];
            const previousFolder = newHistory.pop();
            return {
                ...state,
                folderHistory: newHistory,
                currentFolder: previousFolder || null,
            };

        case "CLEAR_FOLDER_HISTORY":
            return {
                ...state,
                folderHistory: [],
            };

        default:
            return state;
    }
};

export default FileBrowserReducer;
