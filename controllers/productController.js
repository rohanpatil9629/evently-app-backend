const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");
const { fileSizeFromatter } = require("../utils/fileUpload");
const cloudinary = require("cloudinary").v2;

const createProduct = asyncHandler(async (req, res) => {
  const { name, sku, category, quantity, price, description } = req.body;

  // Validation

  if (!name || !category || !quantity || !price || !description) {
    res.status(400);
    throw new Error("Please fill in  all fields");
  }

  //Handle image upload

  let fileData = {};

  if (req.file) {
    // save image to cloudinary

    let uploadedFile;
    try {
      uploadedFile = await cloudinary.uploader.upload(req.file.path, {
        folder: "Pinvent App",
        resource_type: "image",
      });
    } catch (error) {
      res.status(500);
      throw new Error("Image could not be uploaded");
    }

    fileData = {
      fileName: req.file.originalname,
      filePath: uploadedFile.secure_url,
      fileType: req.file.mimetype,
      fileSize: fileSizeFromatter(req.file.size, 2),
    };
  }

  // create product
  const product = await Product.create({
    user: req.user.id,
    name,
    sku,
    category,
    quantity,
    price,
    description,
    image: fileData,
  });

  res.status(201).json(product);
});

// get all Product
const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ user: req.user.id }).sort("-createdAt");
  res.status(200).json(products);
});

// get single product

const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  // If does not exist
  if (!product) {
    res.status(404);
    throw new Error("Product not found ");
  }
  //Match Product to its user
  if (product.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("User Not Authorized");
  }

  res.status(200).json(product);
});

// delete product

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  // If does not exist
  if (!product) {
    res.status(404);
    throw new Error("Product not found ");
  }
  //Match Product to its user
  if (product.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("User Not Authorized");
  }

  await product.remove();
  res.status(200).json({ message: "Product deleted." });
});

//Update Product
const updateProduct = asyncHandler(async (req, res) => {
  const { name,category, quantity, price, description } = req.body;
  const { id } = req.params;
  const product = await Product.findById(id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found ");
  }

  if (product.user.toString() !== id) {
    res.status(401);
    throw new Error("User Not Authorized");
  }

  //Handle image upload
  let fileData = {};
  if (req.file) {
    // save image to cloudinary
    let uploadedFile;
    try {
      uploadedFile = await cloudinary.uploader.upload(req.file.path, {
        folder: "Pinvent App",
        resource_type: "image",
      });
    } catch (error) {
      res.status(500);
      throw new Error("Image could not be uploaded");
    }

    fileData = {
      fileName: req.file.originalname,
      filePath: uploadedFile.secure_url,
      fileType: req.file.mimetype,
      fileSize: fileSizeFromatter(req.file.size, 2),
    };
  }

  // update product

  const updatedProduct = await Product.findByIdAndUpdate(
    {
      _id : id,
    },
    {
        name,
        category,
        quantity,
        price,
        description,
        image : fileData || product.image,
    },
    {
        new :true ,
        runValidators: true
    }
  );


  res.status(200).json(updatedProduct);
});

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  deleteProduct,
  updateProduct,
};
