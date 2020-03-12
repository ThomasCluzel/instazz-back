// Description of the schema for posts

import mongoose from "mongoose";
const Schema = mongoose.Schema;

//TODO: Change mongoDB schema to JSON Object
var ImageSchema = new Schema({
  /*path: {
    type: String,
    required: true
  },*/
  contentType: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true,
    unique: true
  },
  imageData : {
    type: String,
    required: true
  }
});

let Image = mongoose.model("Image", ImageSchema);
export {Image};

var PostSchema = new Schema({
  description: String,
  author: {
    type: Schema.Types.ObjectId, 
    ref: "User",
    required: true
  },
  image: {
    type: Schema.Types.ObjectId, 
    ref: "Image",
    required: true
  },
  publication_date: {
    type: Date
  }
});

PostSchema.index({ name: 1 });
let Post = mongoose.model("Post", PostSchema);

export {Post};
