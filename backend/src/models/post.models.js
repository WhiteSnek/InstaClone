import mongoose,{Schema} from "mongoose";

const postSchema = new Schema({
    url:{
        type: String,
        required: true
    },
    caption:{
        type:String
    },
    tags:[{
        type: Schema.Types.ObjectId,
        ref: "Tag"
    }],
    owner:{
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    comments:[{
        type: Schema.Types.ObjectId,
        ref: "Comment"
    }],
},{timestamps: true})

export const Post = mongoose.model("Post",postSchema)