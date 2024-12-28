const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const sendEmail = require("../utils/sendEmail");

const  contactUs = asyncHandler(async(req,res)=>{
    // res.send("contact US")
    const {subject ,message} = req.body
    const user = await User.findById(req.user._id)

    if(!user){
        res.status(400)
        throw new Error("User not found please signup")
    }

    // validation 

    if(!subject || !message)
    {
        res.status(400)
        throw new Error("Please add new subject and message")
    }
    

})


module.exports = {
    contactUs,
}