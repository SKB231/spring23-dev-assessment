import mongoose, { Schema } from "mongoose";

const trainingModelSchema = new Schema({
  date: {
    type: Schema.Types.Date,
    required: true,
  }, // date of training log
  description: {
    type: Schema.Types.String,
    required: true,
  }, // description of training log
  hours: {
    type: Schema.Types.Number,
    required: true,
  }, // number of hours the training log records
  animal: {
    type: Schema.Types.ObjectId,
    required: true,
  }, // animal this training log corresponds to
  user: {
    type: Schema.Types.ObjectId,
    required: true,
  }, // user this training log corresponds to
  trainingLogVideo: {
    type: Schema.Types.ObjectId,
    required: false,
  }, // pointer to training log video in cloud storage --> used in Expert level
});

export default mongoose.model("TrainingModel", trainingModelSchema);
