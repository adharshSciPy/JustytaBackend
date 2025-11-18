import Router from "express";
import { firmAdminLogin, getAllLawFirms, getLawFirmById, registerFirmAdmin } from "../controller/firmAdminController.js";
import { uploadFirmAdminDocs } from "../utils/multerConfig.js";
import { multerErrorHandler } from "../utils/multerErrorhandler.js";

const firmAdminRouter = Router();

firmAdminRouter.route("/register").post(uploadFirmAdminDocs, multerErrorHandler, registerFirmAdmin);//to register lawfirms
firmAdminRouter.route("/login").post(firmAdminLogin)//lawfirm login
firmAdminRouter.route("/firm_details").get(getAllLawFirms);//to fetch all law firms
firmAdminRouter.route("/firm_details_/:id").get(getLawFirmById);
export default firmAdminRouter;
