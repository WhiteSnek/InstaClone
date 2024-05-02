import mongoose, {Schema} from "mongoose";

const likeSchema = new Schema({
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: "Post"
    },
    reel: {
        type: Schema.Types.ObjectId,
        ref: "Reel"
    },
    story: {
        type: Schema.Types.ObjectId,
        ref: "Story"
    },
    comment: {
        type: Schema.Types.ObjectId,
        ref: "Comment"
    },
    message: {
        type: Schema.Types.ObjectId,
        ref: "Message"
    },
},{timestamps:true})

export const Like = mongoose.model("Like",likeSchema)