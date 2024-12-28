const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const userSchema = mongoose.Schema({
     name : { 
        type : String , required:[true,"please add a name"]
    },
     email : {
        type : String , required:[true,"please add a email"],
        unique : true,
        trim: true,
        match : [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "please a valid email"
        ]
     },
     password:{
        type : String , 
        required:[true,"please add Password"],
        minLength : [6,"Password must be upto 6 character"],
      //   maxLength : [23,"Password must not  more than 23 character"]


     },
     photo:{
        type : String , 
        required:[true,"please add Image"],
        default:"https://i.ibb.co/4pDNDk1/avatar.png"
     },
     phone:{
        type : String ,
        default:"+91"
     },
     bio:{
        type : String ,
        maxLength : [250,"Bio must not  more than 250 character"],
        default:"Bio"
     }


},{
    timestamps:true, 
}); //extra add semicolumn



// Encrypt password  before saving 
userSchema.pre("save" , async function(next){

if(!this.isModified("password")){
   return next()
}

//hash password 
const salt = await bcrypt.genSalt(10)
const hashedPassword = await bcrypt.hash(this.password,salt) 
this.password =hashedPassword
next();
})
 
const User = mongoose.model("User",userSchema)

module.exports = User  