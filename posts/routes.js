// Routes for /api/v1/posts

import express from 'express';
import bodyParser from "body-parser";
import multer from "multer";
import fs from "fs";
import * as service from './services';

const postRouter = express.Router();
postRouter.use(bodyParser.json());
var upload = multer({ 
    dest: './uploads/'
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

postRouter.post("/", upload.single("photo"), (req, res) => {
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
});

export default postRouter;
