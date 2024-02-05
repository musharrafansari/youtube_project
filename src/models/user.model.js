const mongoose = require("mongoose")
const jwt=require("jsonwebtoken")
const bcrypt=require("bcrypt")
require('dotenv').config();

const userSchema= mongoose.Schema({

    username:{
        type:String,
        require:true,
        unique:true,
        lowerCase:true,
        trim:true,
        index:true   
    },
    email:{
        type:String,
        require:true,
        unique:true,
        lowerCase:true,
        trim:true,
    },
    fullName:{
        type:String,
        require:true,
        trim:true,
        index:true
    },
    avatar:{
        type:String,    // cloud url
        require:true
    },
    coverImage:{
        type:String,   // cloud url
    },
    watchHistory:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    password:{
        type:String,
        require:[true, "Password is reuired"]   /// custom error message
    },
    refreshToken:{
        type:String
    },
},{timestamps:true})

userSchema.pre("save",async function(next){
    console.log("before password=========>")
    if(!this.isModified("password")){
        return next()                         // only save password when come first time 
    }
    this.password= await bcrypt.hash(this.password,10)
    next()
})

userSchema.methods.isPasswordCorrect=async function(password){
   return await bcrypt.compare(password,this.password)      // true or false
}

// userSchema.methods.generateAccessToken =function(){
//     console.log("==jwtttt=====>")
//     jwt.sign(
//         {
//             _id:this._id,
//             email:this.email,
//             username:this.username,
//             fullName:this.fullName
//         },
//         process.env.ACCESS_TOKEN_SECRET,
//         {
//             expiresIn:process.env.ACCES_TOKEN_EXPIRY
//         }
//     )
// }
userSchema.methods.generateAccessToken = function() {
    console.log("==jwtttt=====>");

    const accessToken = jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            // expiresIn: process.env.ACCESS_TOKEN_EXPIRY
            // expiresIn: "86400"  // one day expiry time
            expiresIn: '24h'
        }
    );

    return accessToken; // Return the generated token
};

userSchema.methods.generateRefreshToken = function() {
   
    const refreshToken = jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
             // expiresIn:process.env.REFRESH_TOKEN_EXPIRY
            expiresIn: "30h" 
        }
    );

   
    return refreshToken;
};

// userSchema.methods.generateRefreshToken =function(){
//     jwt.sign(
//         {
//             _id:this._id,     // less info because frequent refresh
//            
//         },
//         process.env.REFRESH_TOKEN_SECRET,
//         {
//             // expiresIn:process.env.REFRESH_TOKEN_EXPIRY
//             // expiresIn:"1000000"   // more than one day expiry time
//             expiresIn: '30h'
//         }
//     )
   
// }

//  const User=mongoose.model("User",userSchema)
// module.exports = User
module.exports = mongoose.model("User", userSchema);