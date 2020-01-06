// Routes for /api/v1/users

import express from 'express';
import bodyParser from "body-parser";

import * as service from './services';

const userRouter = express.Router();
userRouter.use(bodyParser.json());

// GET
userRouter.get("/", (req, res) => {
  service
    .getByPage(req.query.page || 1, req.query.per_page || 10)
    .then(users => res.status(200).json({ users }));
});

// POST
userRouter.post("/", (req, res) => {
    service.createUser(req.body).then(
        users => res.status(200).json(users),
        err => {
            console.error(err);
            res.status(500).send("error");
            return;
        }
    );
});

export default userRouter;
