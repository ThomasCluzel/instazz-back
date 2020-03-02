// Services for posts

import {Image, Post} from "./model";
import path, { dirname } from "path";
import fs from "fs";

// Create
export async function createPost(user, post, img) {
    console.log("[img] - Creation");
    const imgRef = Image.create({...img})
    post.image = (await imgRef)._id;
    post.publication_date = Date.now();
    console.log("[post] - Creation");
    post.author = user._id;
    return Post.create({ ...post });
};

// Read
export async function getByPage(page, per_page, user) {
    let condition= {};
    if(typeof user._id !== 'undefined'){
        condition = {"author" : user._id};
    }
    const start = (page - 1) * per_page;
    //Lean permet d'obtenir un objet pur Javascript
    let result = await Post.find(condition)
        .sort({"publication_date": "desc"})
        .populate({path: "image", select: "filename"})
        .populate("author", "pseudo")
        .skip(start)
        .limit(per_page)
        .lean();
    result.forEach(post => { 
        const pathImage = path.join(post.image.path, post.image.filename)
        let bitmap = fs.readFileSync(pathImage);
        post.imageData = new Buffer.from(bitmap).toString("base64");
        return post;
    });
    return result;
}

