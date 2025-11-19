import Router from "express";
import { firmAdminLogin, getAllLawFirms, getFirmStaffs, getLawFirmById, registerFirmAdmin, registerStaff } from "../controller/firmAdminController.js";
import { uploadDocs } from "../utils/multerConfig.js";
import { multerErrorHandler } from "../utils/multerErrorhandler.js";

const firmAdminRouter = Router();

firmAdminRouter.route("/register").post(uploadDocs, multerErrorHandler, registerFirmAdmin);//to register lawfirms
firmAdminRouter.route("/login").post(firmAdminLogin)//lawfirm login
firmAdminRouter.route("/firm_details").get(getAllLawFirms);//to fetch all law firms
firmAdminRouter.route("/firm_details_/:id").get(getLawFirmById);//to fetch firm details by id
firmAdminRouter.route("/add_staff").post(uploadDocs,multerErrorHandler,registerStaff)//to register staff to firm 
firmAdminRouter.route("/all_staffs/:id").get(getFirmStaffs)
export default firmAdminRouter;
