// Root file of our backend app

// imports
import express from 'express';
import bodyParser from "body-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";

import postRouter from './posts/routes';
import userRouter from './users/routes';
import cors from "cors";

dotenv.config();
// get the current environment
var env = process.env.NODE_ENV

if(!env){
    env = "DEV";
}

// convert to uppercase
var envString = env.toUpperCase()

// access the environment variables for this environment
process.env.MONGO = process.env['MONGO_' + envString]
if(envString !== 'PROD')
    process.env.PORT = process.env['PORT_' + envString]
process.env.UPLOAD_PATH = process.env['UPLOAD_PATH_' + envString]

// Server express.js
const app = express();

// - middlewares
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(process.env.UPLOAD_PATH, express.static('uploads'));
app.use('/api/v1/posts', postRouter);
app.use('/api/v1/users', userRouter);

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
    let server = app.listen(process.env.PORT, () => {
        console.log(`server running on port ${process.env.PORT}`);
    });

    module.exports = server; // for testing

});
