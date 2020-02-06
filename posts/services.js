// Services for posts

import {Image, Post} from "./model";
import path from "path";
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
export async function getByPage(page, per_page) {
    const start = (page - 1) * per_page;
    //Lean permet d'obtenir un objet pur Javascript
    let result = await Post.find({})
        .populate("image")
        .populate("author")
        .skip(start)
        .limit(per_page)
        .lean();
    result.forEach(post => { 
        post.downloadImage = path.join(__dirname, "..", post.image.data)
        let bitmap = fs.readFileSync(post.downloadImage);
        post.imageData = new Buffer.from(bitmap).toString("base64");
        return post;
    });
    return result;
}
