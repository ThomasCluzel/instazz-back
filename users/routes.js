// Routes for /api/v1/users

import express from 'express';
import bodyParser from "body-parser";

import * as service from './services';

const userRouter = express.Router();
userRouter.use(bodyParser.json());

// GET
userRouter.get("", (req, res) => {
    let page = (req.query.page ? parseInt(req.query.page) : 1);
    let per_page = (req.query.page ? parseInt(req.query.per_page) : 10);
    service.getByPage(page, per_page)
        .then(users => res.status(200).json({ users }))
        .catch(function(err){
            console.log("User.createUser: "+err+" "+err.message())
            res.status(500).send("error");
            return;
        });
});

// POST
userRouter.post("", (req, res) => {
    if(req.body && !req.body._id){
        service.createUser(req.body)
            .then(
                users => res.status(200).json(users),
                err => {
                    console.error("User.getByPage: "+err+" "+err.message())
                    res.status(500).send("error");
                    return;
            }
        )
    }
});

export default userRouter;
