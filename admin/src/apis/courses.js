import { API_BASE_URL } from "./server.js";

// Fetch all courses
export const fetchCourses = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}api/admin/dbcourses`, {
            credentials: "include",
            headers: {
                Authorization: "Bearer admin-coursehub-cc23-golang",
            },
        });
        return await response.json();
    } catch (error) {
        console.error("Error fetching courses:", error);
        throw error;
    }
};

// Update course name
export const updateCourseName = async (code, newName) => {
    try {
        const safeCode = code.toLowerCase().trim();
        const response = await fetch(`${API_BASE_URL}api/admin/course/${safeCode}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer admin-coursehub-cc23-golang",
            },
            body: JSON.stringify({ name: newName }),
            credentials: "include",
        });
        return await response.json();
    } catch (error) {
        console.error("Error updating course name:", error);
        throw error;
    }
};

// Create a new course
export const createCourse = async (code, name) => {
    try {
        const response = await fetch(`${API_BASE_URL}api/course/create/${code}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer admin-coursehub-cc23-golang",
            },
            body: JSON.stringify({ name }),
            credentials: "include",
        });
        return await response.json();
    } catch (error) {
        console.error("Error creating course:", error);
        throw error;
    }
};

// Bulk sync courses from CSV data
export const bulkSyncCourses = async (courses, onProgress = null) => {
    const results = {
        created: [],
        updated: [],
        skipped: [],
        errors: [],
    };

    const total = courses.length;
    let processed = 0;

    for (const course of courses) {
        try {
            // First try to create the course
            const createResponse = await createCourse(course.code, course.name);

            if (createResponse.message === "Course created successfully") {
                results.created.push(course);
            } else if (createResponse.message === "Course already exists") {
                // Course exists, check if name needs updating
                const updateResponse = await updateCourseName(course.code, course.name);
                if (updateResponse && updateResponse.code) {
                    results.updated.push(course);
                } else {
                    results.skipped.push(course);
                }
            }
        } catch (error) {
            results.errors.push({ course, error: error.message });
        }

        processed++;
        if (onProgress) {
            onProgress(processed, total);
        }
    }

    return results;
};
