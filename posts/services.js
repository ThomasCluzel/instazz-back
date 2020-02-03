// Services for posts

import {Image, Post} from "./model";

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
    const result = await Post.find({})
        .populate("image")
        .populate("author")
        .skip(start)
        .limit(per_page);
    return result;
}
