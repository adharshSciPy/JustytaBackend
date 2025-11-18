import { Router } from "express";
import { register, login } from "../controller/superAdmincontroller.js";
const superAdminRouter = Router();

superAdminRouter.route("/register").post(register);
superAdminRouter.route("/login").post(login);

export default superAdminRouter;