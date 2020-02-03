// Routes for /api/v1/users

import express from 'express';
import bodyParser from "body-parser";

import * as service from './services';
import { verifyJWT_MW, createJWToken, verifyJWT_isAdmin } from '../libs/auth';

const userRouter = express.Router();
userRouter.use(bodyParser.json());

// GET
userRouter.get("/", (req, res) => {
    let page = (req.query.page ? parseInt(req.query.page) : 1);
    let per_page = (req.query.page ? parseInt(req.query.per_page) : 10);
    service.getByPage(page, per_page)
        .then(users => res.status(200).json({ users }))
        .catch(function(err){
            console.error("User.getByPage: "+err+" "+err.message())
            res.status(500).send("error");
            return;
        });
    }
    , verifyJWT_isAdmin
);

// POST
userRouter.post("/", (req, res) => {
    if(req.body && !req.body._id){
        service.createUser(req.body)
        .then(
            users => res.status(200).json(users),
            err => {
                res.status(500).send("error");
                console.log("User.createUser: "+err+" "+err.message())
                return;
            }
        )
    }
});

//POST
userRouter.post("/signin", (req, res) => {
    if(req.body && !req.body._id){
        service.signIn(req.body)
        .then(
            user => res.status(200).json({
                succes: true,
                token: createJWToken({
                    sessionData:{ 
                        pseudo: user.pseudo,
                        name: user.name,
                        role: user.role
                    },
                    maxAge: 3600
                })
            }),
            err => {
                console.error("Couldn't connect: "+err )
                res.status(401).send("Login or password invalid")
                return;
            }
        )
    }
})

export default userRouter;
