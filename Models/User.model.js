import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
  firstName: {
    type: Schema.Types.String,
    required: true,
  }, // user's first name
  lastName: {
    type: Schema.Types.String,
    required: true,
  }, // user's last name
  email: {
    type: Schema.Types.String,
    required: true,
  }, // user's email
  password: {
    type: Schema.Types.String,
    required: true,
  }, // user's password used only in level 3 and beyond
  //profilePicture?: string // pointer to user's profile picture in cloud storage --> used in Expert level
});

export default mongoose.model("User", userSchema);
