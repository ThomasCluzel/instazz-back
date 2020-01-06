// Routes for /api/v1/posts

import express from 'express';
import bodyParser from "body-parser";

import * as service from './services';

const postRouter = express.Router();
postRouter.use(bodyParser.json());

postRouter.get("/", (req, res) => {
    service
        .getByPage(req.query.page || 1, req.query.per_page || 10)
        .then(posts => res.status(200).json({ posts }));
});

postRouter.post("/", (req, res) => {
    service.createPost(req.body).then(
        post => res.status(200).json(post),
        err => {
            console.error(err);
            res.status(500).send("error");
            return;
        }
    );
});

export default postRouter;
