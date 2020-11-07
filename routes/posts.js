const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Post = require("../models/post");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname);
  },
});
const upload = multer({ storage: storage });

// const upload = multer({ dest:"uploads/" });

router.get("/all", (req, res) => {
  Post.find()
    .select("title description SubTitle postImage")
    .exec()
    .then((posts) => {
      res.status(200).json({ posts });
    })
    .catch((err) => {
      res.status(400).json({ err });
    });
});

router.post("/new", upload.single("postImage"), (req, res) => {
  console.log(req.file);
  const post = new Post({
    title: req.body.title,
    SubTitle: req.body.SubTitle,
    description: req.body.description,
    savedPost: req.body.savedPost,
    postImage: req.file.path,
  });
  post
    .save()
    .then((postData) => {
      res.status(201).json({ message: "create success", postData });
    })
    .catch((err) => {
      res.status(400).json({ err });
    });
});

router.delete("/posts/:postId", (req, res) => {
  Post.remove({ _id: req.params._id })
    .exec()
    .then((result) => {
      res.status(200).json({ message: "order deleted" }, result);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.get("/all/savedPost", (req, res, next) => {
  Post.find(req.body.savedPost)
    .exec()
    .then((postData) => {
      
    });
});

module.exports = router;
