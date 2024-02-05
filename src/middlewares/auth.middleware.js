const { asyncHandler } = require("../utils/asyncHandler.js")
const { ApiError } = require("../utils/ApiError.js")
const {ApiResponse}=require("../utils/ApiResponse.js")
const userModel = require("../models/user.model.js")
const jwt=require("jsonwebtoken")
const { use } = require("../routes/user.routes.js")
require('dotenv').config();


const verifyJWT=asyncHandler(async(req,res,next)=>{
   try {
    const token= req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "")
    // console.log("token===>",token)
    // return
    if(!token){
     throw new ApiError(401,"Unauthorized request.")
    }
 
    const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    // console.log("decodedToken===>",decodedToken)
    // return
    const AUTH=await userModel.findById(decodedToken._id)
    
    if(!AUTH){
     throw new ApiError(401,"Invalid Access Token.")   //error?.message
    }
    req.AUTH=AUTH
    next()
   } catch (error) {
    throw new ApiError(401,error,"Invalid Access Token.")
    
   }
})

module.exports = {
    verifyJWT: verifyJWT,
}