import mongoose from "mongoose";
import validator from "validator";

const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,                                                                                            //this
        ref: 'User'                 //used to form relationship b/w user and task, has to be the same as typed in /model/User ---> [const User = mongoose.model('User',userSchema)]
    }
}, {
    timestamps: true
})

const Task = mongoose.model('Task', taskSchema)

export default Task;