import express from "express";
import { getAllFiles, verifyFile, unverifyFile, getFileLink } from "./file.controller.js";
import isAuthenticated from "../../middleware/isAuthenticated.js";
import { isBR } from "../../middleware/isBR.js"; // if it's a named export
import { downloadFiles, downloadFilesProxy } from "../../scripts/downloadFile.js";

const router = express.Router();

router.get("/all", isAuthenticated, getAllFiles);
router.put("/verify/:id", isAuthenticated, isBR, verifyFile);
// router.delete("/unverify/:id", isAuthenticated, isBR, unverifyFile);
router.delete("/unverify/:id", unverifyFile);
// route to download file
router.post("/download", downloadFiles);
router.post("/download-proxy", downloadFilesProxy);
router.get("/link/:id", getFileLink);

export default router;
