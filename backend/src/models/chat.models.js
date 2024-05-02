import mongoose,{Schema} from "mongoose";

const chatSchema = new Schema({
    title:{
        type: String,
        required: true
    },
    participants:[{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    message:{
        type: Schema.Types.ObjectId,
        ref: "Message"
    },
    post:{
        type: Schema.Types.ObjectId,
        ref: "Post"
    },
    reel:{
        type: Schema.Types.ObjectId,
        ref: "Reel"
    },
    story:{
        type: Schema.Types.ObjectId,
        ref: "Story"
    },
},{timestamps:true})

export const Chat = mongoose.model("Chat",chatSchema)