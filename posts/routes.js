// Routes for /api/v1/posts

import express from 'express';
import bodyParser from "body-parser";
import multer from "multer";
import fs from "fs";
import * as service from './services';
import { verifyJWT_MW, verifyJWT_Connected, verifyJWT_isConnected } from "../libs/auth"

const postRouter = express.Router();
postRouter.use(bodyParser.json());

//Image upload
const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './uploads/');
    },
    filename: function(req, file, cb){
        cb(null, Date.now() + file.originalname);
    }
})
const fileFilter = (req, file, cb) => {
    if(file.mimetype === "image/jpeg" || file.mimetype === "image/png"){
        cb(null, true);
    }
    else{
        cb(null, false);
    }
}
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
})

postRouter.get("/", (req, res) => {
    const page = (req.query.page) ? parseInt(req.query.page) : 1;
    const per_page = (req.query.per_page) ? parseInt(req.query.per_page) : 10;
    service
        .getByPage(page, per_page)
        .then(posts => {
            res.status(200).json({ posts })
            res.contentType(post.image.contentType);
            res.send(post.image.data);
        });
});

postRouter.post("/", upload.single("imageData"), (req, res) => {
    console.log("post your post");
    if(req.body && !req.body._id && req.file){
        var image;
        image.data = req.file.path;
        image.contentType = req.file.mimetype;
        image.filename = req.file.originalname;
        service.createPost(req.body, image).then(
            post => {
                res.status(200).json(post);
            },
            err => {
                console.error(err);
                res.status(500).send("error");
                return;
            }
        );
    }
}
, verifyJWT_isConnected
);

export default postRouter;
