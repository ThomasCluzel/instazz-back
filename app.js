// Root file of our backend app

// imports
import express from 'express';
import bodyParser from "body-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";

import postRouter from './posts/routes';
import userRouter from './users/routes';

dotenv.config();

// Server express.js
const app = express();

// - middlewares
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/api/v1/posts/', postRouter);
app.use('/api/v1/users/', userRouter);

// Database mongoose
mongoose.connect(
    process.env.MONGO,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
);
let db = mongoose.connection;
db.on("error", console.error.bind(console, "error:"));
db.once("open", function() {
    // launch server
    app.listen(process.env.PORT, () => {
        console.log(`server running on port ${process.env.PORT}`);
    });
});
