// blogpost.model.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// BlogPost Schema
const BlogPostSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  SubTitle: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },
  savedPost: {
    type: Boolean,
    default: false,
  },
  postImage: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  tags: [String],
  updated: {
    type: Date,
  },
});
module.exports = mongoose.model("BlogPost", BlogPostSchema);
