const express = require("express");
const router = express.Router();
const User = require("../models/user");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const SendOtp = require("sendotp");
const { result } = require("lodash");
const sendOtp = new SendOtp(
  "326538AxyvhZSWQ5e9c4c16P1",
  " {{otp}}, please do not share it with anybody"
);
var smtpTransport = nodemailer.createTransport({
  host: "priyanshu.s1619@gmail.com",
  port: 344,
  secure: false,
  auth: {
    user: "priyanshu.s1619@gmail.com",
    pass: "PSps@161962682742",
  },
});

// Signup or Register
router.post("/signup", (req, res, next) => {
  User.findOne({ Email: req.body.Email })
    .exec()
    .then((user) => {
      if (user.length >= 1) {
        return res.status(409).json({ message: "Mail/MobileNo. Exists" });
      } else {
        bcrypt.hash(req.body.Password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({ error: err });
          } else {
            const user = new User(req.body);
            user
              .save()
              .then((result) => {
                res.status(201).json({ message: "user created" });
              })
              .catch((err) => {
                console.log(err);
                res.status(500).json({
                  error: err,
                });
              });
          }
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

// Login with email Verification
router.post("/login", (req, res, next) => {
  User.find({ Email: req.body.Email })
    .exec()
    .then((user) => {
      if (user.length < 1) {
        return res.status(401).json({ message: "Mail/User Doesnt Exist" });
      }
      bcrypt.compare(req.body.Password, user.Password, (error, response) => {
        if (error) {
          return res.status(401).json({
            message: " Authentication Failed.",
          });
        }
        if (response) {
          const token = jwt.sign({ Email: user.Email }, "secret", {
            expiresIn: "1h",
          });

          if (user.EmailVerification === false) {
            smtpTransport.sendMail(
              {
                from: "priyanshu.s1619@gmail.com",
                to: user.Email,
                subject: "Email Address Verification",
                html: `<b>Hello</b> ${user.Firstname} <br /> ${token}>Click here</a> `,
              },
              function (err, result) {
                if (err) {
                  return res.status(500).json(err);
                } else if (result) {
                  return res.status(403).json("Verify Mail to login");
                }
              }
            );
          } else {
            return res.status(200).json({ message: "Login Successful" }, token);
          }
          res.status(401).json({ message: "Auth Failed" });
        }
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

// router.get("/verify", function (req, res) {
//   console.log(req.protocol + ":/" + req.get("priyanshu.s1619@gmail.com"));
//   if (
//     req.protocol + "://" + req.get("priyanshu.s1619@gmail.com") ==
//     "http://" + host
//   ) {
//     console.log("Domain is matched. Information is from Authentic email");
//     if (req.query.id == rand) {
//       console.log("email is verified");
//       res.end("<h1>Email " + mailOptions + " is been Successfully verified");
//     } else {
//       console.log("email is not verified");
//       res.end("<h1>Bad Request</h1>");
//     }
//   } else {
//     res.end("<h1>Request is from unknown source");
//   }
// });

// Email activation
router.post("/email-activate", (req, res) => {
  const { token } = req.body;
  if (token) {
    jwt.verify(token, "accountactivate", function (err, decodedToken) {
      if (err) {
        return res.status(400).json({ err: "incorrect or expired Link" });
      }
      const { Email, Password } = decodedToken;

      User.findOne({
        Email: req.body.Email,
      }).then((result) => {
        if (result.length < 1) {
          return res.status(400).json({
            message:
              " No user found with this maill address or Verification Code is Wrong",
          });
        } else {
          const Email = req.body.Email;
          User.update({ Email: Email })
            .exec()
            .then((result) => {
              res.status(200).send({
                message: "Email Verified",
                res: result,
              });
            })
            .catch((err) => {
              res.status(500).json({
                message: err,
              });
            });
        }
      });
    });
  }
});

// forget password
router.put("/forgetpass", (req, res, next) => {
  const { Email } = req.body;
  User.findOne({ Email }, (err, user) => {
    if (err || !user) {
      return res.status(401).json({ message: "Mail/User Doesnt Exist" });
    }
    const token = jwt.sign({ _id: user._id }, "secretss", {
      expiresIn: "1h",
    });
    const mailOptions = {
      from: "priyanshu.s1619@gmail.com",
      to: Email,
      subject: "PassWord Change",
      html: `
      "Hello this is token ${token},<br> Please Click on the link to Reset your password.<br>"`,
    };
    return user.updateOne({ resetLink: token }, function (err, res) {
      if (err) {
        return res.status(401).json({ err: "reset password link error" });
      } else {
        smtpTransport.sendMail(mailOptions, function (error, response) {
          if (error) {
            console.log(error);
            res.end("error");
          } else {
            console.log("Email Message sent ");
            res.end("Email Message sent ");
          }
        });
      }
    });
  });
});

// reset-pass
router.put("/reset-pass", (req, res, next) => {
  const { resetLink, newPass } = req.body;
  if (resetLink) {
    jwt.verify(resetLink, "123456", function (err, data) {
      if (err) {
        return res.status(401).json({ message: "incorrect token" });
      }
      User.findOne({ resetLink }, (err, user) => {
        if (err || !user) {
          return res.status(400).json({ error: "MAil dosesnt exist" });
        }
        const obj = {
          Password: newPass,
        };
        user = _.extend(user, obj);
        user.save((err, result) => {
          if (err) {
            return res.status(400).json({ error: "reset password error" });
          } else {
            return res.status(200).json({ error: "your password changed" });
          }
        });
      });
    });
  } else {
    return res.status(401).json({ err: "Authentication Error" });
  }
});

// Update user profile
router.put("/update/:Email", (req, res, next) => {
  User.update(
    { Email: req.params.Email },
    {
      EmailIsVerified: req.body.EmailIsVerified,
      MobileNumber: req.body.MobileNumber,
      Firstname: req.body.Firstname,
      Lastname: req.body.Lastname,
    }
  )
    .then((result) => {
      res.status(200);
      res.json({
        message: "Profile updated Successfully",
      });
    })
    .catch((error) => {
      res.status(500);
      res.json({
        message: error,
      });
    });
});

// Send Otp
router.get("/sendotp", (req, res, next) => {
  User.find({ MobileNumber: req.body.MobileNumber }).then((number) => {
    if (number.length < 1) {
      return res.status(404).json({
        message: "Mobile Number doesnt Exist",
      });
    } else {
      sendOtp.send(req.body.MobileNumber, "pcentric", function (error, result) {
        if (error) {
          return res.status(500).json({ message: "OTP send Failed ", error });
        } else {
          return res.status(200).json({
            message: "OTP send Success",
            result,
          });
        }
      });
    }
  });

  // sendOtp.send("917518098889", "senderId", "1619", function (error, data) {
  //   console.log(data);
  //   if (data.type == "success") {
  //     return res.status(200).json({ message: "OTP Send" });
  //   }
  //   if (data.type == "error") {
  //     return res.status(400).json({ message: "Failed" });
  //   }
  // });
});

router.get("/verifyotp", (req, res, next) => {
  const { MobileNumber, Otp } = req.body;

  User.findOne({ MobileNumber }, (err, user) => {
    if (err || result.length < 1) {
      return res.status(401).json({ message: "MobileNumber Doesnt Exist" });
    } else {
      sendOtp.verify(MobileNumber, Otp, function (error, data) {
        console.log(data); // data object with keys 'message' and 'type'
        if (data.type == "success") {
          return res.status(200).json({ message: "OTP Verified" });
        }
        if (data.type == "error") {
          return res
            .status(400)
            .json({ message: "Otp failed or Already verified" });
        }
      });
    }
  });
});

module.exports = router;
