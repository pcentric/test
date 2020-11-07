// const express = require("express");
// const router = express.Router();
// const mongoose = require("mongoose");
// const Notification = require('../models/notificcation')

// router.get('/notifications', (req, res) => {

// })

// router.post('/notify', (req, res, next) => {
//     const notification = new Notification(req.body)
//         .save().then((result) => {
//             res.status(201).json({ message: "notification created succes", result });
//         })
//         .catch((err) => {
//             res.status(400).json({ err });
//         });
// })