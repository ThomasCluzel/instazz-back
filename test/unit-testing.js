import chai from "chai";
let should = chai.should();
import chaiHttp from "chai-http";
import {describe, it} from "mocha";
import chaiDateTime from "chai-datetime"

import dotenv from "dotenv";
import fs from "fs";
import path from "path";

import { hashString } from '../users/services';
import User from '../users/model';
import {Post, Image} from '../posts/model';
import server from "../app";
import {createJWToken} from "../libs/auth"

dotenv.config()

process.env.MONGO = process.env.MONGO_TEST;
process.env.PORT = process.env.PORT_TEST
process.env.UPLOAD_PATH = process.env.UPLOAD_PATH_TEST

chai.use(chaiHttp);
chai.use(chaiDateTime)

const url = "http://localhost:" + process.env.PORT  

var requester = chai.request(url).keepOpen()

describe("hooks", function(){

    before(function(){
        return dropDatabasePromise()
    })

    after(function(){
        return new Promise((resolve, reject) => {
            console.log("End of tests")
            try{
                requester.close()
                resolve()
            }
            catch(err){
                console.error(err)
                reject(err)
            }
        })
    })

    describe("/api/v1/users", function() {

        const hashedPassword1 = hashString("myPassword")
        const user1 = {
            name: "user1",
            pseudo: "pseudo_user1",
            password: "myPassword",
            role: "user"
        }

        const user2 = {
            name: "user2",
            pseudo: "pseudo_user2",
            password: "myPassword",
            role: "user"
        }

        const user3 = {
            name: "user3",
            pseudo: "pseudo_user3",
            password: "myPassword",
            role: "user"
        }

        const hashedPassword2 = hashString("tata123")
        const user4 = {
            name: "toto",
            pseudo: "tutu",
            password: "tata123",
            role: "admin"
        }

        describe("Post /", function() {
            before(function(){
                return new Promise( (resolve, reject) => {
                    User.create({
                        name: user2.name,
                        pseudo: user2.pseudo,
                        password: hashedPassword1})
                    .then((res) => {
                        //console.log("Database set")
                        resolve()
                    })
                    .catch((err) => {
                        console.error(err)
                        reject(err)
                    })
                })
            })

            after( function(){
                return new Promise((resolve, reject) => {
                    User.deleteMany({}, (err) => {
                        if(err){
                            console.error(err);
                            reject(err)
                            return;
                        }
                        //console.log("Database cleaned")
        
                        resolve();
                    })
                })
            })

            it('it should post user with default role', function() {
                return requester
                    .post("/api/v1/users")
                    .set("Content-Type", "application/json")
                    .send({...user4})
                    .then((res) => {
                        console.log(res.body)
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property("token")
                        res.body.should.have.property("pseudo").eql(user4.pseudo)
                        res.body.should.have.property("name").eql(user4.name)
                        res.body.should.have.property("role").eql("user")
                        
                        return User.findOne({pseudo: user4.pseudo})
                        .then((result) => {
                                result.should.be.a("object");
                                result.should.have.property("pseudo").eql(user4.pseudo)
                                result.should.have.property("name").eql(user4.name)
                                result.should.have.property("role").eql("user")
                                result.should.have.property("password").eql(""+hashedPassword2)
                        })
                        .catch((err) => {
                            throw err;
                        });
                    })
                    .catch((err) => {
                        throw err;
                    })
                
            })

            it('it should not post user with same username', () => {
                return requester
                    .post("/api/v1/users")
                    .set("Content-Type", "application/json")
                    .send({...user2})
                    .then((res) => {
                        console.log(res.body)
                        res.should.have.status(500);
                        
                        should.not.exist(res.body.pseudo)
                    })
                    .catch((err) => {
                        throw err;
                    })
            })
        })
        
        describe("Post /signin", function() {
            before(function(){
                return new Promise( (resolve, rejectUser) => {
                    User.create({
                        name: user4.name,
                        pseudo: user4.pseudo,
                        role: "admin",
                        password: hashedPassword2
                    })
                    .then((res) => {
                        //console.log("Database set")
                        resolve()
                    })
                    .catch((err) => {
                        console.error(err)
                        reject(err)
                    })
                })
           })

            after( function(){
                return new Promise((resolve, reject) => {
                    User.deleteMany({}, (err) => {
                        if(err){
                            console.error(err);
                            reject(err)
                            return;
                        }
                        //console.log("Database cleaned")
        
                        resolve();
                    })
                })
            })

            it('it should connect the user', () => {
                return requester
                    .post("/api/v1/users/signin")
                    .set("Content-Type", "application/json")
                    .send({
                        pseudo: user4.pseudo,
                        password: user4.password
                    })
                    .then((res) => {
                        console.log(res.body)
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property("token")
                        res.body.should.have.property("pseudo").eql(user4.pseudo)
                        res.body.should.have.property("name").eql(user4.name)
                        res.body.should.have.property("role").eql(user4.role)
                    })
                    .catch((err) => {
                        throw err;
                    })
            })

            it('it should not connect the user', () => {
                return requester
                    .post("/api/v1/users/signin")
                    .set("Content-Type", "application/json")
                    .send({
                        pseudo: user4.pseudo,
                        password: user4.password + "NotEqual",
                    })
                    .then( (res) => {
                        console.log(res.body)
                        res.should.have.status(500);
                        
                        should.not.exist(res.body.pseudo);
                    })
                    .catch((err) => {
                        throw err;
                    })
            })
        })

        describe("Get /", function() {
            let adminToken;
            let userToken

            before(function(){
                return new Promise(async function(resolve, reject) {
                    try{
                        const u1 = await User.create({...user1});
                        await User.create({...user2});
                        await User.create({...user3});
                        const u4 = await User.create({...user4});
                        
                        adminToken = createJWToken({
                            sessionData:{ 
                                _id: u4._id,
                                pseudo: user4.pseudo,
                                name: user4.name,
                                role: user4.role
                            },
                            maxAge: 3600
                        });
                        userToken = createJWToken({
                            sessionData:{ 
                                _id: u1._id,
                                pseudo: user1.pseudo,
                                name: user1.name,
                                role: user1.role
                            },
                            maxAge: 3600
                        });
                        //console.log("Database set")

                        resolve()
                    }
                    catch(err){
                        console.error(err)
                        reject(err)
                    }
                })
            })

            after( function(){
                return new Promise((resolve, reject) => {
                    User.deleteMany({}, (err) => {
                        if(err){
                            console.error(err);
                            reject(err)
                            return;
                        }
                        //console.log("Database cleaned")
        
                        resolve();
                    })
                })
            })

            it('it should get all users', () => {
                return requester
                    .get("/api/v1/users/")
                    .set("Authorization", adminToken)
                    .then( (res) => {      
                        console.log(res.body)
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        const users = res.body.users;
                        res.body.users.should.be.a('array')
                        users.length.should.equal(4);
                        users[0].should.have.property("role")
                        users[0].should.have.property("name")
                        users[0].should.have.property("pseudo")
                    })
                    .catch((err) => {
                        throw err;
                    })
            })

            it('it should get 2 users', () => {
                return requester
                    .get("/api/v1/users")
                    .set("Authorization", adminToken)
                    .query({page: 2, per_page:2})
                    .then( (res) => {
                        console.log(res.body)
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        const users = res.body.users;
                        res.body.users.should.be.a('array')
                        users.length.should.equal(2);
                        users[0].should.have.property("role")
                        users[0].should.have.property("name")
                        users[0].should.have.property("pseudo")
                    })
                    .catch((err) => {
                        throw err;
                    })
            })

            it('it should deny access', () => {
                return requester
                    .get("/api/v1/users/")
                    .set("Authorization", userToken)
                    .then((res) => {
                        console.log(res.body)
                        res.should.have.status(500);
                        
                        should.not.exist(res.body.users);
                    })
                    .catch((err) => {
                        throw err;
                    })
            })
        })

    })
    
    describe("/api/v1/posts", function() {

        const user1 = {
            name: "nodeJS",
            pseudo: "nodeJS",
            password: hashString("myPassword"),
            role: "user"
        }

        const user2 = {
            name: "react",
            pseudo: "react",
            password: hashString("myPassword"),
            role: "user"
        }

        const img1 = {
            path: process.env.UPLOAD_PATH,
            contentType: "image/jpeg",
            filename: "nodeJS.jpg"
        }
        const img2 = {
            path: process.env.UPLOAD_PATH,
            contentType: "image/png",
            filename: "react.png"
        }

        let imageBase64_1;
        let imageBase64_2;

        let post1 = {
            description: "My first nodeJS post",
            publication_date : Date.now()
        }

        let post2 = {
            description: "My first react post",
            publication_date : Date.now()
        }

        let post3 = {
            description: "My second react post",
            publication_date : Date.now()
        }

        before(function(){
            post1.pseudo = user1.pseudo;
            post2.pseudo = user2.pseudo;
            post3.pseudo = user2.pseudo;

            post1.image = img1;
            post2.image = img2;
            post3.image = img2;

            let bitmap1 = fs.readFileSync(path.join(path.resolve(__dirname), "resources/" + img1.filename));
            imageBase64_1 = new Buffer.from(bitmap1).toString("base64");
            let bitmap2 = fs.readFileSync(path.join(path.resolve(__dirname), "resources/" + img2.filename));
            imageBase64_2 = new Buffer.from(bitmap2).toString("base64");

            post1.image64 = imageBase64_1;
            post2.image64 = imageBase64_2;
            post3.image64 = imageBase64_2;
        })

        describe("Get /", function() {

            before(function(){
                return new Promise(async(resolve, reject) => {
                    try{
                        const u1 = await User.create({...user1});
                        const u2 = await User.create({...user2});

                        const image1 = await Image.create({...img1});
                        const image2 = await Image.create({...img2});

                        await Post.create({
                            description: post1.description,
                            publication_date: post1.publication_date,
                            author: u1._id,
                            image: image1._id
                        })
                        await Post.create({
                            description: post2.description,
                            publication_date: post2.publication_date,
                            author: u2._id,
                            image: image2._id
                        })
                        await Post.create({
                            description: post3.description,
                            publication_date: post3.publication_date,
                            author: u2._id,
                            image: image2._id
                        })

                        return fs.copyFile(path.join(path.resolve(__dirname), "resources/"+img1.filename), path.join(process.env.UPLOAD_PATH, img1.filename), (err) => {
                            if(err)
                                throw err
                            fs.copyFile(path.join(path.resolve(__dirname), "resources/"+img2.filename), path.join(process.env.UPLOAD_PATH, img2.filename), (err) =>{
                                if(err)
                                    throw err
                                //console.log("Database set")

                                resolve()
                            })
                        })
                    }
                    catch(err){
                        console.error(err)
                        reject(err)
                    }
                })
            })

            after(function(){
                return dropDatabasePromise();
            })

            it('it should get all posts', () => {
                return requester
                    .get("/api/v1/posts/")
                    .then((res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        const posts = res.body.posts;
                        res.body.posts.should.be.a('array')
                        posts.length.should.equal(3);

                        posts[0].should.have.property("publication_date");
                        posts[1].should.have.property("publication_date");
                        //TODO
                        //should(String(posts[0].publication_date).localCompare(String(posts[1].publication_date))).be.eql(1);

                        posts[0].should.have.property("description")
                        posts[0].image.should.have.property("filename")
                        posts[0].author.should.have.property("pseudo")
                        posts[0].should.have.property("imageData")

                        posts.forEach(post => {
                            post.imageData = "[data]"
                        });
                        console.log(res.body)
                    })
                    .catch((err) => {
                        throw err
                    })
            })

            it('it should get 1 post', () => {
                return requester
                    .get("/api/v1/posts/")
                    .query({page: 2, per_page: 2})
                    .then( (res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        const posts = res.body.posts;
                        res.body.posts.should.be.a('array')
                        posts.length.should.equal(1);
                        posts[0].should.have.property("publication_date");
                        posts[0].should.have.property("description")
                        posts[0].image.should.have.property("filename")
                        posts[0].author.should.have.property("pseudo")
                        posts[0].should.have.property("imageData")

                        posts.forEach(post => {
                            post.imageData = "[data]"
                        });
                        console.log(res.body)
                    })
                    .catch((err) => {
                        throw err
                    })
            })

        })

        describe("Post /", function() {
            let user1Token;

            before(function(){

                return new Promise(async(resolve, reject) => {
                    try{
                        const u1 = await User.create({...user1});
                        
                        user1Token = createJWToken({
                            sessionData:{ 
                                _id: u1._id,
                                pseudo: user1.pseudo,
                                name: user1.name,
                                role: user1.role
                            },
                            maxAge: 3600
                        });
                        //console.log("Database set")

                        resolve()
                    }
                    catch(err){
                        console.error(err)
                        reject(err)
                    }
                })
            })

            after(function(){
                return dropDatabasePromise();
            })

            it('it should upload the post', () => {
                return requester
                    .post("/api/v1/posts")
                    .set("Content-Type", "multipart/form-data")
                    .set("Authorization", user1Token)
                    .attach("imageData", fs.readFileSync(path.join(path.resolve(__dirname), "resources/"+post1.image.filename)), post1.image.filename)
                    .field({
                        description: post1.description,
                    })
                    .then((res) => {
                        console.log(res.body)
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property("description").eql(post1.description)
                        res.body.should.have.property("image")
                        res.body.should.have.property("author")
                        res.body.should.have.property("publication_date")

                        return Post.findOne({description: post1.description}).populate("author").populate("image")
                        .then((result) => {
                            result.should.be.a("object");
                            result.should.have.property("description").eql(post1.description)
                            result.should.have.property("image")
                            result.image.should.have.property("filename")
                            result.image.should.have.property("contentType").eql(post1.image.contentType)
                            result.image.should.have.property("path").eql(process.env.UPLOAD_PATH)
                            result.author.should.have.property("pseudo").eql(post1.pseudo)
                            result.should.have.property("publication_date")
                            
                            let bitmap = fs.readFileSync(path.join(result.image.path, result.image.filename));
                            const imageBase64 = new Buffer.from(bitmap).toString("base64");
                            imageBase64.should.eql(imageBase64_1);
                        })
                        .catch((err) =>{
                            throw err
                        });
                    })
                    .catch((err)=>{
                        throw err
                    })
            })

            
            it('it should deny access', () => {
                return requester
                    .post("/api/v1/posts")
                    .set("Content-Type", "multipart/form-data")
                    .set("Authorization", user1Token+"NotEqual")
                    .attach("imageData", fs.readFileSync(path.join(path.resolve(__dirname), "resources/"+post1.image.filename)), post1.image.filename)
                    .field({
                        description: post1.description,
                    })
                    .then( (res) => {
                        console.log(res.body)
                        res.should.have.status(500);
                        should.not.exist(res.body.posts)
                    })
                    .catch((err)=>{
                        throw err
                    })
            })

        })

        describe("Get /myposts/", function() {

            let user1Token;

            before(function(){
                return new Promise(async (resolve, reject) => {
                        try{
                        const u1 = await User.create({...user1});
                        const u2 = await User.create({...user2});

                        const image1 = await Image.create({...img1});
                        const image2 = await Image.create({...img2});

                        const p1 = await Post.create({
                            description: post1.description,
                            publication_date: post1.publication_date,
                            author: u1._id,
                            image: image1._id,
                        })
                        const p2 = await Post.create({
                            description: post2.description,
                            publication_date: post2.publication_date,
                            author: u2._id,
                            image: image2._id,
                        })

                        fs.copyFile(path.join(path.resolve(__dirname), "resources/"+img1.filename), path.join(process.env.UPLOAD_PATH, img1.filename), (err) => {
                            if(err)
                                throw err
                            fs.copyFile(path.join(path.resolve(__dirname), "resources/"+img2.filename), path.join(process.env.UPLOAD_PATH, img2.filename), (err) =>{
                                if(err)
                                    throw err
                                user1Token = createJWToken({
                                    sessionData:{ 
                                        _id: u1._id,
                                        pseudo: u1.pseudo,
                                        name: u1.name,
                                        role: u1.role
                                    },
                                    maxAge: 3600
                                });
                                //console.log("Database set")

                                resolve()
                            })
                        })
                    }
                    catch(err){
                        console.error(err)
                        reject(err)
                    }
                })
            })

            after(function(){
                return dropDatabasePromise()
            })

            it('it should get my posts', () => {

               return  requester
                    .get("/api/v1/posts/myposts")
                    .set("Authorization", user1Token)
                    .then( (res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        const posts = res.body.posts;
                        res.body.posts.should.be.a('array')
                        posts.length.should.equal(1);

                        posts[0].should.have.property("publication_date");
                        posts[0].should.have.property("description").eql(post1.description)
                        posts[0].image.should.have.property("filename").eql(post1.image.filename)
                        posts[0].author.should.have.property("pseudo").eql(post1.pseudo)
                        posts[0].should.have.property("imageData").eql(post1.image64)

                        posts.forEach(post => {
                            post.imageData = "[data]"
                        });
                        console.log(res.body)
                    })
                    .catch((err) => {
                        throw err
                    })
            })

            it('it should be denied access', () => {

                return requester
                    .get("/api/v1/posts/myposts")
                    .set("Authorizarion", user1Token+"NotEqual")
                    .then( (res) => {
                        console.log(res.body)
                        res.should.have.status(500);
                        
                        should.not.exist(res.body.posts);
                    })
                    .catch((err) => {
                        throw err
                    })
            })
        })
        
    })
});


function dropDatabasePromise(){
    return new Promise((resolve, reject) => {
        fs.readdir(process.env.UPLOAD_PATH, (err, files) => {
            if(err){
                console.error(err);
                reject(err)
                return;
            }
            files.map((file) => {
                fs.unlinkSync(path.join(process.env.UPLOAD_PATH, file));
            })

            return Promise.all(files).then((res) => {
                Image.deleteMany({}, (err) => {
                    if(err){
                        console.error(err);
                        reject(err)
                        return;
                    }
                    Post.deleteMany({}, (err) => {
                        if(err){
                            console.error(err);
                            reject(err)
                            return;
                        }
                        User.deleteMany({}, (err) => {
                            if(err){
                                console.error(err);
                                reject(err)
                                return;
                            }
                            //console.log("Database cleaned")
                            resolve();
                        })
                    })
                })
            })
            .catch(err => {
                console.error(err);
                reject(err)
                return;
            });
        })
    })
}