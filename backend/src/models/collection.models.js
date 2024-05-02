import mongoose,{Schema} from "mongoose";

const collectionSchema = new Schema({
    name:{
        type: String,
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    reel: [{
        type: Schema.Types.ObjectId,
        ref: "Reel"
    }],
    post: [{
        type: Schema.Types.ObjectId,
        ref: "Post"
    }],
},{timestamps:true})

export const Collection = mongoose.model("Collection",collectionSchema)