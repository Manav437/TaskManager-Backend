import mongoose from "mongoose";
import dotenv from "dotenv";
import Task from "../models/task.js";

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("DB connected");

        await Task.updateMany(
            { completed: false, dueDate: { $lt: new Date() } },
            { $set: { status: "overdue" } }
        );

        console.log("Overdue tasks updated");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();