// Description of the schema for users

import mongoose from "mongoose";
const Schema = mongoose.Schema;

var UserSchema = new Schema({
    name: String,
    pseudo: {
        type: String,
        index: true,
        unique: true
    },
    password: String
});

UserSchema.index({ name: 1 });
let User = mongoose.model("User", UserSchema);
User.createIndexes();

export default User;
