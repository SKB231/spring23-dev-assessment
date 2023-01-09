import mongoose, { Schema } from "mongoose";


const animalModelSchema = new Schema(
    {
        name: {
            type: Schema.Types.String,
            required: true,
          }, // Animal's name
        hoursTrained: {
            type: Schema.Types.Number,
            required: true,
          }, // total number of hours the animal has been trained for
        owner: {
            type: Schema.Types.ObjectId,
            required: true,
          }, // id of the animal's owner
        dateOfBirth: {
            type: Schema.Types.Date,
            required: false
        } // animal's date of birth
        //profilePicture?: string // pointer to animal's profile picture in cloud storage --> used in Expert level
    }
)

export default mongoose.model("AnimalModel", animalModelSchema)
