// Services for posts

import Post from "./model";

// Create
export async function createPost(post) {
    if (post) {
        if (!post._id) {
            console.log("[post] - Creation");
            return Post.create({ ...post });
        }
    }
};

// Read
export async function getByPage(page, per_page) {
    var start = (parseInt(page) - 1) * parseInt(per_page);
    let result = await Post.find({})
        .populate({
            path: "author.ref",
            model: "User"
        })
        .skip(start)
        .limit(parseInt(per_page));
    return result;
}
