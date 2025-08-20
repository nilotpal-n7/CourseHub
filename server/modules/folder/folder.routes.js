import express from "express";
import { createFolder,deleteFolder,getFolderContent, renameFolder } from "./folder.controller.js";
import isAuthenticated from "../../middleware/isAuthenticated.js";
import  {isBR}  from "../../middleware/isBR.js"; // if it's a named export

const router = express.Router();

router.post("/create", isAuthenticated, isBR, createFolder);
router.delete("/delete", isAuthenticated, isBR, deleteFolder);
router.get("/content/:folderId", getFolderContent);
router.post("/rename", isAuthenticated, isBR, renameFolder)

export default router;
