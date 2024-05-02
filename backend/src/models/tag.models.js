import mongoose, {Schema} from "mongoose";

const tagSchema = new Schema({
    content:{
        type:String,
        required:true
    }
},{timestamps: true})

export const Tag = mongoose.model("Tag",tagSchema)