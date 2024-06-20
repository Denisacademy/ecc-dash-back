const port = 4000;
const express = require("express");
const dotenv = require("dotenv").config();
// console.log("PROCESS", process.env.KEY);

const app = express();

// TS DB
const mongoose = require("mongoose");
// AUTH
const jwt = require("jsonwebtoken");
// LOAD IMAGES
const multer = require("multer");

const path = require("path");
// CROSS DOMAIN
const cors = require("cors");
// NODE_MON
//	"dev": "nodemon ./index.js"

// pass any request as json    ???
app.use(express.json()); //for requrst POST BODY otherwise undefined
app.use(cors());

// CONNECTING DB
// mongoose.connect("mongodb+srv://anycrefname:ecom.js@cluster0.j30yf1v.mongodb.net/");
mongoose.connect(`mongodb+srv://${process.env.KEY}@cluster0.j30yf1v.mongodb.net`);

// API CREATION
app.get("/", (req, res) => {
  console.log("YES!!!");
  // hntl plain text data ={arr:  [1,2,3], status : 'ok' }
  res.status(200).send({ arr: [1, 2, 3], status: "ok" });
});

// STORAG IMAGE   CFG
const storage = multer.diskStorage({
  destination: "./upload/images",
  filename: (req, file, cb) => {
    return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

//! ***CREATING UPLOAD ENDPOINT FOR IMAGES  multer UPLOAD***
app.use("/images", express.static("upload/images")); //provide

//! SEPARATE REQUEST load in project folder UPLOAD  click add on F-E call
app.post("/upload", upload.single("product"), (req, res) => {
  // succe img_url
  console.log("uploadFront-END");
  res.json({
    success: 1,
    image_url: `http://localhost:${port}/images/${req.file.filename}`,
  });
});

// PRODUCT SHEMA

const Product = mongoose.model("Product", {
  id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  new_price: {
    type: Number,
    required: true,
  },
  old_price: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  available: {
    type: Boolean,
    default: true,
  },
});

// ALL PRODUCTS

app.get("/products", async (req, res) => {
  const products = await Product.find({});

  res.status(200).send({
    success: "ok",
    data: products,
  });
});

// REMOVE PRODUCT
app.post("/removeproduct", async (req, res) => {
  const { id } = req.body;

  // console.log("Removed", id);
  const result = await Product.findOneAndDelete({ id });
  if (!result) {
    res.status(404).json({
      success: "failed",
      message: "id not found",
    });
  }
  console.log(result);

  res.json({
    success: "ok",
    id,
  });
});

// AWAIT AS DB
app.post("/addproduct", async (req, res) => {
  const products = await Product.find({}); //all products
  let id;

  if (products.length > 0) {
    let last_product_array = products.slice(-1); //[[] ,["our"]]
    console.log(last_product_array);
    let last_product = last_product_array[0];
    id = last_product.id + 1;
  } else {
    id = 1;
  }

  // CREATE PRODUCT
  console.log("body", req.body);
  const { name, image, category, new_price, old_price } = req.body;

  const product = new Product({
    id,
    name,
    image,
    category,
    new_price,
    old_price,
  });
  console.log(product);

  await product.save(product);
  console.log("Saved");
  res.json({
    succes: "ok",
    name,
  });
});

// START SERVER
app.listen(port, (error) => {
  if (!error) console.log("Server is running");
  else console.log("Error: " + error);
});
