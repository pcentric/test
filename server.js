const express = require("express");
const mongoose = require("mongoose");
const bodyParse = require("body-parser");
const cors = require("cors");
require("dotenv/config");
const usersRoute = require("./routes/users");
const postsRoute = require("./routes/posts");

// app config
const app = express();
const port = process.env.PORT || 9000;

// middlewares
app.use(bodyParse.json());
app.use(bodyParse.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
app.use(cors());

//Database
const mongoURI = process.env.DB_CONNECTION;

mongoose.connect(mongoURI, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Routes
app.use("/", usersRoute);
app.use("/", postsRoute);

//For Errors.
app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status(404);
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status);
  res.json({
    message: error.message,
  });
});

//  PORT listener
app.listen(port, () => {
  console.log(`server is on ${port}`);
});
