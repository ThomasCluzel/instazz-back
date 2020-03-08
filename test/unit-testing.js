import chai from "chai";
let should = chai.should();
import chaitHttp from "chai-http";
import {describe, it} from "mocha";

import dotenv from "dotenv";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";

import postRouter from '../posts/routes';
import userRouter from '../users/routes';
import hashString from '../users/services';
import User from '../users/model';
import {Post, Image} from '../posts/model';
import server from "../app";
import createJWTToken, { createJWToken } from "../libs/auth"

process.env.MONGO = process.env.MONGO_TEST;

chai.use(chaiHttp);

describe("hooks", function(){

    before(function(done){
        fs.readdir(process.env.UPLOAD_TEST_PATH, (err, files) => {
            files.forEach(file =>{
                fs.unlink(path.join(process.env.UPLOAD_TEST_PATH, file));
            })
        });
        Image.remove({}, (err) => {
            Post.remove({}, (err) => {
                User.remove({}, (err) => {
                    done();
                })
            })
        })
    })

    describe("/api/v1/users", function() {

        afterEach( function(done){
            User.remove({}, (err) => {
                done();
            })
        })

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
            it('it should post user with default role', (done) => {
                chai.request(server)
                    .post("/api/v1/users")
                    .send(user4)
                    .end( (err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property("success").eql(true)
                        res.body.should.have.property("token")
                        res.body.should.have.property("pseudo").eql(user4.pseudo)
                        res.body.should.have.property("name").eql(user4.name)
                        res.body.should.have.property("role").eql("user")
                        
                        let result = await User.find({});
                        result.length.should.equal(1);
                        result[0].should.be.a("object");
                        result[0].should.have.property("pseudo").eql(user4.pseudo)
                        result[0].should.have.property("name").eql(user4.name)
                        result[0].should.have.property("role").eql("user")
                        done();
                    })
            })

            it('it should not post user with same username', (done) => {
                chai.request(server)
                    .post("/api/v1/users")
                    .send({user4})
                    .end( (err, res) => {
                        res.should.have.status(500);
                        
                        should.not.exist(res.body.pseudo)

                        done()
                    })
            })
        })

        
        describe("Post /signin", function() {
            before(function(){
                User.create({...user4});
            })

            it('it should connect the user', (done) => {
                chai.request(server)
                    .post("/api/v1/users/signin")
                    .send({
                        pseudo: user4.pseudo,
                        password: user4.password,
                    })
                    .end( (err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property("success").eql(true)
                        res.body.should.have.property("token")
                        res.body.should.have.property("pseudo").eql(user4.pseudo)
                        res.body.should.have.property("name").eql(user4.name)
                        res.body.should.have.property("role").eql(user4.role)

                        done();
                    })
            })

            it('it should not connect the user', (done) => {
                chai.request(server)
                    .post("/api/v1/users/signin")
                    .send({
                        pseudo: user4.pseudo,
                        password: user4.password + "NotEqual",
                    })
                    .end( (err, res) => {
                        res.should.have.status(500);
                        
                        should.not.exist(res.body.pseudo);

                        done()
                    })
            })
        })

        describe("Get /", function() {
            let adminToken;

            before(function(){
                User.create({...user1});
                User.create({...user2});
                User.create({...user3});
                User.create({...user4});

                adminToken = createJWToken({...user4});
            })

            it('it should get all users', (done) => {
                chai.request(server)
                    .get("/api/v1/users/")
                    .set("Authorization", adminToken)
                    .end( (err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        const users = res.body.users;
                        res.body.users.should.be.a('array')
                        users.length.should.equal(4);
                        users[0].should.have.property("pseudo").eql(user1.pseudo)
                        users[0].should.have.property("name").eql(user1.name)
                        users[0].should.have.property("role").eql(user1.role)
                        users[0].should.have.property("password").eql(hashedPassword1)
                        done();
                    })
            })

            it('it should get 2 users', (done) => {
                chai.request(server)
                    .get("/api/v1/users/?page=1,per_page=2")
                    .set("Authorization", adminToken)
                    .end( (err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        const users = res.body.users;
                        res.body.users.should.be.a('array')
                        users.length.should.equal(2);
                        users[0].should.have.property("pseudo").eql(user1.pseudo)
                        users[0].should.have.property("name").eql(user1.name)
                        users[0].should.have.property("role").eql(user1.role)
                        users[0].should.have.property("password").eql(hashedPassword1)
                        done();
                    })
            })

            it('it should deny access', (done) => {
                chai.request(server)
                    .get("/api/v1/users/")
                    .set("Authorization", adminToken+"NotEqual")
                    .end( (err, res) => {
                        res.should.have.status(500);
                        
                        should.not.exist(res.body.users);
                        done();
                    })
            })
        })

    })
    
    describe("/api/v1/posts", function() {

        afterEach( function(done){
            fs.readdir(process.env.UPLOAD_TEST_PATH, (err, files) => {
                files.forEach(file =>{
                    fs.unlink(path.join(process.env.UPLOAD_TEST_PATH, file));
                })
            });
            Image.remove({}, (err) => {
                Post.remove({}, (err) => {
                    User.remove({}, (err) => {
                        done();
                    })
                })
            })
        })

        const user1 = {
            name: "nodeJS",
            pseudo: "nodeJS",
            password: "myPassword",
            role: "user"
        }

        const user2 = {
            name: "react",
            pseudo: "react",
            password: "myPassword",
            role: "user"
        }

        const img1 = {
            _id: 1,
            path: process.env.UPLOAD_TEST_PATH,
            contentType: "image/jpeg",
            filename: "nodeJS.jpg"
        }
        const img2 = {
            _id: 2,
            path: process.env.UPLOAD_TEST_PATH,
            contentType: "image/png",
            filename: "react.png"
        }

        let imageBase64_1;
        let imageBase64_2;

        let post1 = {
            description: "My first nodeJS post"
        }

        let post2 = {
            description: "My first react post"
        }

        let post3 = {
            description: "My second react post"
        }

        before(function(){
            post1.author = user1._id;
            post1.pseudo = user1.pseudo;
            post2.author = user2._id;
            post2.pseudo = user2.pseudo;
            post3.author = user2._id;
            post3.pseudo = user2.pseudo;

            post1.image = img1;
            post2.image = img2;
            post3.image = img2;

            let bitmap1 = fs.readFileSync("./resources/" + img1.filename);
            imageBase64_1 = new Buffer.from(bitmap1).toString("base64");
            let bitmap2 = fs.readFileSync("./resources/" + img2.filename);
            imageBase64_2 = new Buffer.from(bitmap2).toString("base64");

            post1.image64 = imageBase64_1;
            post2.image64 = imageBase64_2;
            post3.image64 = imageBase64_2;
        })

        describe("Get /", function() {

            before(function(){
                const user1 = await User.create({...user1});
                const user2 = await User.create({...user2});

                const image1 = await Image.create({...img1});
                const image2 = await Image.create({...img2});

                const post1 = await Post.create({
                    description: post1.description,
                    author: user1._id,
                    image: image1._id,
                })
                const post2 = await Post.create({
                    description: post2.description,
                    author: user2._id,
                    image: image2._id,
                })
                const post3 = await Post.create({
                    description: post3.description,
                    author: user2._id,
                    image: image2._id,
                })

                await fs.copyFile("./resources/"+img1.filename, path.join(process.env.UPLOAD_TEST_PATH, img1.filename))
                await fs.copyFile("./resources/"+img2.filename, path.join(process.env.UPLOAD_TEST_PATH, img2.filename))

            })

            it('it should get all posts', (done) => {
                chai.request(server)
                    .get("/api/v1/posts/")
                    .end( (err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        const posts = res.body.posts;
                        res.body.posts.should.be.a('array')
                        posts.length.should.equal(3);

                        posts[0].should.have.property("publication_date");
                        posts[1].should.have.property("publication_date");
                        posts[0].publication_date.should.be.gt(posts[1].publication_date);

                        posts[0].should.have.property("description").eql(post3.description)
                        posts[0].image.should.have.property("filename").eql(post3.image.filename)
                        posts[0].author.should.have.property("pseudo").eql(post3.pseudo)
                        posts[0].should.have.property("imageData").eql(post3.image64)
                        done();
                    })
            })

            it('it should get 1 post', (done) => {
                chai.request(server)
                    .get("/api/v1/posts/?page=2,per_page=2")
                    .end( (err, res) => {
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

                        done();
                    })
            })

        })

        describe("Post /", function() {
            let user1Token;

            before(function(){
                const user1 = User.create({...user1});
                user1Token = createJWToken({...user1});
            })

            it('it should upload the post', (done) => {
                chai.request(server)
                    .post("/api/v1/posts")
                    .set("Content-Type", "multipart/form-data")
                    .set("Authorization", user1Token)
                    .send({
                        "description": post1.description,
                        "imageData": path.join(path.resolve(__dirname), "resources/"+post1.image.filename)
                    })
                    .end( (err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property("description").eql(post1.description)
                        res.body.should.have.property("image")
                        res.body.should.have.property("author").eql(post1.author)
                        res.body.should.have.property("publication_date");

                        let result = await Post.find({}).populate("author").populate("image");
                        result.length.should.equal(1);
                        result[0].should.be.a("object");
                        result[0].should.have.property("description").eql(post1.description)
                        result[0].should.have.property("image")
                        result[0].image.should.have.property("filename").eql(post1.image.filename)
                        result[0].image.should.have.property("contentType").eql(post1.image.contentType)
                        result[0].image.should.have.property("path").eql(post1.image.path)
                        result[0].author.should.have.property("pseudo").eql(post1.pseudo)
                        result[0].should.have.property("publication_date");
                        
                        let bitmap = fs.readFileSync(path.join(result[0].path, result[0].filename));
                        imageBase64 = new Buffer.from(bitmap1).toString("base64");
                        imageBase64.should.eql(imageBase64_1);

                        done();
                    })
            })

            
            it('it should deny access', (done) => {
                chai.request(server)
                    .post("/api/v1/posts")
                    .set("Content-Type", "multipart/form-data")
                    .set("Authorization", user1Token+"NotEqual")
                    .send({
                        "description": post1.description,
                        "imageData": path.join(path.resolve(__dirname), "resources/"+post1.image.filename)
                    })
                    .end( (err, res) => {
                        res.should.have.status(500);
                        should.not.exist(res.body.posts)

                        done();
                    })
            })

        })

        describe("Get /myposts/", function() {

            let user1Token;

            before(function(){
                const user1 = await User.create({...user1});
                const user2 = await User.create({...user2});

                const image1 = await Image.create({...img1});
                const image2 = await Image.create({...img2});

                const post1 = await Post.create({
                    description: post1.description,
                    author: user1._id,
                    image: image1._id,
                })
                const post2 = await Post.create({
                    description: post2.description,
                    author: user2._id,
                    image: image2._id,
                })

                await fs.copyFile("./resources/"+img1.filename, path.join(process.env.UPLOAD_TEST_PATH, img1.filename))
                await fs.copyFile("./resources/"+img2.filename, path.join(process.env.UPLOAD_TEST_PATH, img2.filename))

                user1Token = createJWTToken({...user1})
            })

            it('it should get my posts', (done) => {

                chai.request(server)
                    .get("/api/v1/posts/myposts")
                    .set("Authorizarion", user1Token)
                    .end( (err, res) => {
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
                        done();
                    })
            })

            it('it should be denied access', (done) => {

                chai.request(server)
                    .get("/api/v1/posts/myposts")
                    .set("Authorizarion", user1Token+"NotEqual")
                    .end( (err, res) => {
                        res.should.have.status(500);
                        
                        should.not.exist(res.body.posts);

                        done();
                    })
            })

        })

    })
});
