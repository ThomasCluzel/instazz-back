// Services for posts

import {Image, Post} from "./model";
import path, { dirname } from "path";
import fs from "fs";

// Create
export async function createPost(post, img) {
    console.log("[img] - Creation");
    const imgRef = Image.create({...img})
    post.image = (await imgRef)._id;
    console.log("[post] - Creation");
    return Post.create({ ...post });
};

// Read
export async function getByPage(page, per_page, pseudo) {
    let condition= {};
    if(typeof pseudo !== 'undefined'){
        contiditon = {"pseudo" : pseudo};
    }
    const start = (page - 1) * per_page;
    //Lean permet d'obtenir un objet pur Javascript
    let result = await Post.find(condition)
        .populate({path: "image", select: "path filename"})
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

