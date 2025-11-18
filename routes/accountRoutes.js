import { Router } from "express";

import { createEmailAccount,listEmailAccounts } from "../controller/mailAccountController.js";


const emailAccountRouter=Router()

emailAccountRouter.route('/createEmail').post(createEmailAccount)
emailAccountRouter.route('/getEmails').get(listEmailAccounts)

export default emailAccountRouter;

