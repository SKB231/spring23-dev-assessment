import mongoose, { Schema } from "mongoose";

const fileSchema = new mongoose.Schema({
    data: Buffer,
    name: String,
    mimetype: String
  });
  export default mongoose.model('File', fileSchema);