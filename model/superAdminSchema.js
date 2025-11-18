import mongoose, { Schema } from "mongoose";

const superAdmin = new Schema({
    name: {
        type: String
    }
})
const SuperAdmin = mongoose.model("Superadmin", superAdmin)
export default SuperAdmin 