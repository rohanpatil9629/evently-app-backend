
const experss  = require("express");
const router = experss.Router();


const { registerUser, loginUser, logout, getUser, loginStatus, updateUser, changePassword, forgotPassword} = require("../controllers/userController");
// const forgotPassword = require("../controllers/userController")
const protect = require("../middleWare/authMiddleware");

// const  registerUser =()=>{};

router.post("/register" , registerUser);
router.post("/login",loginUser)
router.get("/logout",logout);
router.get("/getuser", protect ,getUser);
router.get("/loggedin",loginStatus);
router.patch("/updateuser",protect,updateUser);
router.patch("/changepassword",protect,changePassword);
router.post("/forgotpassword",forgotPassword);
  
 
module.exports = router
