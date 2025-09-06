import AppError from "../../utils/appError.js";
import CourseModel from "../course/course.model.js";
import fs from "fs";
import csv from "csv-parser";
import User from "../user/user.model.js";
import { UserUpdate } from "../miscellaneous/miscellaneous.model.js";

// Get all courses from DB
export async function getDBCourses(req, res, next) {
    try {
        const dbCourses = await CourseModel.find({});
        return res.json(dbCourses);
    } catch (err) {
        return next(new AppError(500, "Failed to fetch courses"));
    }
}

// Upload courses via CSV file (comma-separated)
export async function uploadCourses(req, res, next) {
    if (!req.file) return next(new AppError(400, "No file uploaded"));
    const results = [];
    fs.createReadStream(req.file.path)
        .pipe(csv(["code", "name"]))
        .on("data", (data) => results.push(data))
        .on("end", async () => {
            try {
                await Promise.all(
                    results.map(async ({ code, name }) => {
                        if (!code || !name) return null;
                        const codeUpper = code.trim().toUpperCase();
                        let course = await CourseModel.findOne({
                            code: new RegExp(`^${codeUpper}$`, "i"),
                        });
                        if (!course) {
                            course = await CourseModel.create({ code: codeUpper, name });
                        } else {
                            course.code = codeUpper;
                            course.name = name;
                            await course.save();
                        }
                    })
                );
                fs.unlinkSync(req.file.path);
                // Fetch and return the full course list
                const allCourses = await CourseModel.find({});
                res.json(allCourses);
            } catch (err) {
                fs.unlinkSync(req.file.path);
                next(new AppError(500, "Failed to process CSV"));
            }
        });
}

export async function renameCourse(req, res, next) {
    const { code } = req.params;
    const { name, newCode } = req.body;

    if (!name) {
        return next(new AppError(400, "Name required"));
    }

    const codeUpper = code.trim().toUpperCase();

    // If a newCode is provided, check for conflicts (case-insensitive, trimmed)
    if (newCode) {
        const newCodeUpper = newCode.trim().toUpperCase();
        // If the new code is different from the current code, ensure it doesn't already exist
        if (newCodeUpper !== codeUpper) {
            const conflict = await CourseModel.findOne({ code: newCodeUpper });
            if (conflict) {
                return next(new AppError(400, "Course code already exists"));
            }
        }
    }

    const course = await CourseModel.findOneAndUpdate(
        { code: codeUpper },
        { name, code: newCode ? newCode.trim().toUpperCase() : codeUpper },
        { new: true }
    );
    if (!course) {
        return next(new AppError(404, "Course not found"));
    }

    // Preprocess user data to clean up code fields - remove all spaces and convert to uppercase
    const allUsers = await User.find({});
    for (const user of allUsers) {
        user.courses = user.courses.map((c) => ({
            ...c,
            code: c.code?.replace(/\s+/g, "").toUpperCase(),
        }));
        user.previousCourses = user.previousCourses.map((c) => ({
            ...c,
            code: c.code?.replace(/\s+/g, "").toUpperCase(),
        }));
        user.readOnly = user.readOnly.map((c) => ({
            ...c,
            code: c.code?.replace(/\s+/g, "").toUpperCase(),
        }));
        await user.save();
    }

    const users = await User.find({
        $or: [
            { courses: { $elemMatch: { code: codeUpper } } },
            { previousCourses: { $elemMatch: { code: codeUpper } } },
            { readOnly: { $elemMatch: { code: codeUpper } } },
        ],
    });

    for (const user of users) {
        await UserUpdate.deleteOne({ rollNumber: user.rollNumber });
    }

    res.json(course);
}
