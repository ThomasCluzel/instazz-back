// Services for posts

import {Image, Post} from "./model";

// Create
export async function createPost(post, img) {
    var imgRef = Image.create({...img})
    post["image"] = imgRef;
    console.log("[post] - Creation");
    return Post.create({ ...post });
};

// Read
export async function getByPage(page, per_page) {
    const start = (page - 1) * per_page;
    const result = await Post.find({})
        .populate({
            path: "author.ref",
            model: "User"
        })
        .skip(start)
        .limit(per_page);
    return result;
}
