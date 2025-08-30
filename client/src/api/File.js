import axios from "axios";
import serverRoot from "./server";

const API = axios.create({
    baseURL: `${serverRoot}/api`,
    withCredentials: true,
});

// Attach token to every request if available (from localStorage)
API.interceptors.request.use((req) => {
    const user = JSON.parse(localStorage.getItem("profile"));
    if (user) req.headers.Authorization = `Bearer ${user.token}`;
    return req;
});

// File Download (all)
export const downloadFile = async (fileId) => {
    const { data } = await API.get(`/file/download/${fileId}`);
    return data;
};

// File Preview (all)
export const previewFile = async (fileId) => {
    const { data } = await API.get(`/file/preview/${fileId}`);
    return data;
};

// Fetch Verified Files (for all users)
export const fetchAllFiles = async () => {
    const { data } = await API.get("/file/all");
    return data;
};

// Verify a file (BR only)
export const verifyFile = async (fileId) => {
    const { data } = await API.put(`/files/verify/${fileId}`);
    return data;
};

// Unverify (delete) a file (BR only)
export const unverifyFile = async (fileId, oneDriveId, folderId) => {
    await API.delete(`/files/unverify/${fileId}`, {
        data: {
            oneDriveId,
            folderId,
        },
    });
};

export const getThumbnail = async (fileId) => {
    const resp = await axios.post(`${serverRoot}/api/file/thumbnail`, {
        fileId: fileId,
    });
    // console.log("Thumbnail Refreshed");
};

export const getFileDownloadLink = async (fileId) => {
    const response = await fetch(serverRoot + "/api/files/download", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: fileId }),
    });

    if (!response.ok) {
        throw new Error(`Error fetching download link: ${response.statusText}`);
    }

    const data = await response.json();
    return data.downloadLink;
};
