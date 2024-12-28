const experss  = require("express");
const protect = require("../middleWare/authMiddleware");
const { createProduct, getProducts, getProduct, deleteProduct, updateProduct } = require("../controllers/productController");
const { upload } = require("../utils/fileUpload");
const router = experss.Router();

router.post("/",protect , upload.single("image"), createProduct)
router.get("/",protect , getProducts)
router.get("/:id",protect , getProduct)
router.delete("/:id",protect , deleteProduct)
router.patch("/:id",protect , upload.single("image"), updateProduct)

module.exports = router; 