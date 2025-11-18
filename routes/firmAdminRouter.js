import Router from "express";
import { registerFirmAdmin } from "../controller/firmAdminController.js";
import { uploadFirmAdminDocs } from "../utils/multerConfig.js";
import { multerErrorHandler } from "../utils/multerErrorhandler.js";

const firmAdminRouter = Router();

firmAdminRouter
  .route("/register")
  .post(uploadFirmAdminDocs, multerErrorHandler, registerFirmAdmin);

export default firmAdminRouter;
