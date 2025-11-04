import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Task from "./task.js";

//userSchema is used to implement 'middleware'
const userSchema = new mongoose.Schema(
    {
        // we used 'User' as the name but once we check in 3T it is 'users',bcoz
        name: {
            //mongoose lowercases it and pluralizes also to both user and task
            type: String,
            required: true, //this is a validator, has to provided by the user
            trim: true, //trim any whitespaces
        },
        email: {
            type: String,
            unique: true, //ensures email for register are unique and cant be used by more than one person
            required: true,
            trim: true,
            lowercase: true,
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error("Email is invalid!!");
                }
            },
        },
        age: {
            type: Number,
            default: 0, //provide a default value if user doesnt provides one
            validate(value) {
                //this is a custom validator, value is the query given by the user
                if (value < 0) {
                    throw new Error("Age must be a positive number");
                }
            },
        },
        password: {
            type: String,
            minlength: 7,
            required: true,
            trim: true,
            validate(value) {
                if (value.toLowerCase().includes("password")) {
                    //toLowerCase is used bcoz the user may type "PASSWORD" yk :)
                    throw new Error(
                        "the password cant contain the string - password",
                    );
                }
            },
        },
        tokens: [
            {
                token: {
                    type: String,
                    required: true,
                },
            },
        ],
        avatar: {
            type: Buffer, //to store image as  binary data
        },
    },
    {
        //this 2nd object is used to enable timestamps
        timestamps: true, //keeps in track when user was created and when it was last updated
    },
);

//virtual property
userSchema.virtual("tasks", {
    ref: "Task",
    localField: "_id", //these field are mentioned to establish relationship b/w task and user
    foreignField: "owner",
});

// used to not show password and token to the user, only send basic info back
// userSchema.methods.getPublicProfile = function () {          1st method
userSchema.methods.toJSON = function () {
    //2nd method
    const user = this;
    const userObject = user.toObject(); //raw data
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;

    return userObject;
};

//generate auth tokens
//these are accessible on instances of model i.e. user
userSchema.methods.generateAuthToken = async function () {
    //fxn has to be normal fxn
    const user = this;
    const token = jwt.sign({ _id: user.id.toString() }, process.env.JWT_SECRET); //id needs to be converted to string
    //above //id is embedded in the token

    user.tokens = user.tokens.concat({ token: token });
    await user.save();
    return token;
};

//statics are accessible on models i.e. User
//login checking credentials for /routers/user.js
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email: email });
    if (!user) {
        throw new Error("Unable to login!");
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new Error("Unable to login!");
    }
    return user;
};

//pre and post are the methods for middleware
userSchema.pre("save", async function (next) {
    //'save' is the name of the event, then the function(dont use arrow fxn[bcoz of 'this' binding])
    const user = this;

    // console.log('just before saving!');                 //will create a user, and print the statement, but if u then try to update that user, it will bypass mongoose
    // therefore, updation done in /router/user.js

    if (user.isModified("password")) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

//another middleware
//delete user tasks when a user is removed(remove all tasks linked to a user when he deletes his user account)
userSchema.pre("remove", async function (next) {
    const user = this;
    Task.deleteMany({ owner: user._id });
    next();
});

const User = mongoose.model("User", userSchema);
export default User;

//mongoose
//User -> user -> users
