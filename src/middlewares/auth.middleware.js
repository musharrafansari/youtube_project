const { asyncHandler } = require("../utils/asyncHandler.js")
const { ApiError } = require("../utils/ApiError.js")
const {ApiResponse}=require("../utils/ApiResponse.js")
const userModel = require("../models/user.model.js")
const jwt=require("jsonwebtoken")
require('dotenv').config();


const verifyJWT=asyncHandler(async(req,res,next)=>{
   try {
    const token= req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "")
    if(!token){
     throw new ApiError(401,"Unauthorized request.")
    }
 
    const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
 
    const user=await userModel.findById(decodedToken._id)
    if(!user){
     throw new ApiError(401,"Invalid Access Token.")
    }
    req.user=user
    next()
   } catch (error) {
    throw new ApiError(401,error?.message,"Invalid Access Token.")
    
   }
})

module.exports = {
    verifyJWT: verifyJWT,
}