const mongoose = require("mongoose");
// eslint-disable-next-line no-unused-vars
let dotenv = require("dotenv").config();

mongoose
  .connect(
    "mongodb+srv://muhsin:S3z6SNe86y5MmxrD@cluster0.8tkdq4l.mongodb.net/ecommerce",
    {
      useNewUrlParser: true,
    },
  )
  .then(() => {
    console.log("CONNECTED TO DATABASE");
  })
  .catch((e) => {
    console.log(`Error = ${e}`);
  });
