import { Router } from "express";
import { register, login, requestPasswordReset, resetPassword } from "../controller/superAdmincontroller.js";
const superAdminRouter = Router();

superAdminRouter.route("/register").post(register);
superAdminRouter.route("/login").post(login);
superAdminRouter.post("/request-reset", requestPasswordReset);
superAdminRouter.post("/reset-password/:token", resetPassword);

export default superAdminRouter;