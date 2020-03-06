// Routes for /api/v1/users

import express from 'express';
import bodyParser from "body-parser";

import * as service from './services';
import { verifyJWT_MW, createJWToken, verifyJWT_isAdmin } from '../libs/auth';

const userRouter = express.Router();
userRouter.use(bodyParser.json());

//Get all users
userRouter.get("/", verifyJWT_isAdmin, (req, res) => {
    let page = (req.query.page ? parseInt(req.query.page) : 1);
    let per_page = (req.query.per_page ? parseInt(req.query.per_page) : 10);
    service.getByPage(page, per_page)
        .then(users => res.status(200).json({ users }))
        .catch(function(err){
            console.error("User.getByPage: "+err)
            res.status(500).send("Error while fetching users.");
            return;
        });
    }

);

//Post to create user
userRouter.post("/", (req, res) => {
    if(req.body && !req.body._id){
        service.createUser(req.body)
        .then(
            user => {
                signIn(req, res);
            },
            err => {
                res.status(500).send("Username already taken");
                console.error("User.createUser: "+err)
                return;
            }
        )
    }
    else{
        res.status(500).send("You need to send arguments.");
    }
});

//Post to signing
userRouter.post("/signin", (req, res) => {
    signIn(req, res);
})

function signIn(req, res){
    if(req.body && !req.body._id){
        service.signIn(req.body)
        .then(
            user => res.status(200).json({
                succes: true,
                token: createJWToken({
                    sessionData:{ 
                        _id: user._id,
                        pseudo: user.pseudo,
                        name: user.name,
                        role: user.role
                    },
                    maxAge: 3600
                }),
                _id: user._id,
                pseudo: user.pseudo,
                name: user.name,
                role: user.role
            }),
            err => {
                console.error("Couldn't connect: "+err )
                res.status(401).send("Login or password invalid")
                return;
            }
        )
    }
    else {
        res.status(500).send("You need to send arguments.");
    }
}

export default userRouter;
