// Routes for /api/v1/posts

import express from 'express';
import bodyParser from "body-parser";
import multer from "multer";
import * as service from './services';
import { verifyJWT_MW, verifyJWT_Connected, verifyJWT_isConnected, verifyJWT_isRightUser } from "../libs/auth"

const postRouter = express.Router();
postRouter.use(bodyParser.json());

//Image upload
let fileName = "";
const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, process.env.UPLOAD_PATH);
    },
    filename: function(req, file, cb){
        fileName =  Date.now() + file.originalname;
        cb(null, fileName);
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
        },
        err => {
            console.error(err);
            res.status(500).send("error");
        });
});

postRouter.get("/myposts", verifyJWT_isRightUser, (req, res) => {
    if(req.body && !req.body._id && req.file){

        const page = (req.query.page) ? parseInt(req.query.page) : 1;
        const per_page = (req.query.per_page) ? parseInt(req.query.per_page) : 10;
        service
            .getByPage(page, per_page, req.body.pseudo)
            .then(posts => {
                res.status(200).json({ posts })
            },
            err => {
                console.error(err);
                res.status(500).send("error");
            });
    }
});

postRouter.post("/", verifyJWT_isConnected, upload.single("imageData"), (req, res) => {
    if(req.body && !req.body._id && req.file){
        let image = [];
        image.path = process.env.UPLOAD_PATH;
        image.contentType = req.file.mimetype;
        image.filename = fileName;
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
);

export default postRouter;
