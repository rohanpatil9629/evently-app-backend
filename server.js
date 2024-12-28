// import Dotenv from "dotenv"
const dotenv  = require("dotenv").config();
// import express from "express"
const express = require("express")
 
// import mongoose from "mongoose" 
const mongoose = require("mongoose")
// import bodyParser from "body-parser" 
const bodyParser = require("body-parser")  

// import cors from "cros"
const cors = require("cors") 
// Dotenv.config(); 
  
 
const path = require("path") 
const userRoute =  require("./routes/userRoute") 
const productRoute =  require("./routes/productRoute") 
const contactRoute =  require("./routes/contactRoute") 
 
const errorHandler = require("./middleWare/errorMiddleware");
// const { forgotPassword } = require("./controllers/userController");
const cookieParser = require("cookie-parser")  
  
const app = express() 
//middlewares 
app.use(express.json()) 
app.use(cookieParser())
app.use(express.urlencoded({extended:false}))
app.use(bodyParser.json( ))
app.use(cors({
origin : ["http://localhost:3000","https://evently-app-frontend.vercel.app"],
//extra chan
credentials : true,
}));


app.use("/uploads",express.static(path.join(__dirname,"uploads")))

//routes Middleware
app.use("/api/users",userRoute);
app.use("/api/products",productRoute);
app.use("/api/contactus",contactRoute);
// app.use("/api/forgotpassword")
//  app.use("/api")
 


//Routes
app.get("/",(req,res)=>{res.send("Home page");})

 
// Error Middleware
 

app.use(errorHandler);
 
// connect to mongodb and start server
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
.then(()=>{
    app.listen(PORT,()=>{
        console.log(`Server Running on port ${PORT}`)
    })
}) 
.catch((err)=>{console.log(err);}) 
              