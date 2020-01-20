// Description of the schema for posts

import mongoose from "mongoose";
const Schema = mongoose.Schema;

var ImageSchema = new Schema({
  data: String,
  contentType: String,
  filename: String
});

let Image = mongoose.model("Image", ImageSchema);
export {Image};

var PostSchema = new Schema({
  description: String,
  author: {
    name: String,
    ref: { type: Schema.Types.ObjectId, ref: "User" },
  },
  image: {
    type: Schema.Types.ObjectId, 
    ref: "Image",
    required: true
  }
});

PostSchema.index({ name: 1 });
let Post = mongoose.model("Post", PostSchema);

export default Post;
