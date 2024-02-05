const { asyncHandler } = require("../utils/asyncHandler.js");
const { ApiError } = require("../utils/ApiError.js");
const { ApiResponse } = require("../utils/ApiResponse.js");
const mongoose = require("mongoose");
const { User } = require("../models/user.model.js"); // Adjust the import statement
const { uploadCloudinary } = require("../utils/cloudinary.js");
const userModel = require("../models/user.model.js");
const { required, options } = require("joi");
const jwt = require("jsonwebtoken")
const { userSchema } = require("../validators/userSchema.js"); // Assuming it's userSchema, not userSchem

const generateAccessAndRefreshTokens = async function (userId) {
    try {

        let id = userId.toString()
        // return
        const user = await userModel.findById(id);
        const accessToken = await user.generateAccessToken();

        const refreshToken = await user.generateRefreshToken();
        // console.log("---refered",accessToken)

        // return
        user.refreshToken = refreshToken;
        // await user.save({ validateBeforeSave: false });
        await user.save();

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, error.message);
    }
};

module.exports = {
    generateAccessAndRefreshTokens,
    // ... (other exports)
};



const registerUser = asyncHandler(async (req, res) => {

    console.log("sssssss")

    const { fullName, email, username, password } = req.body

    //  used joi validator for validating request body  ===================

    // const {error, value} = userSchem.validate(req.body)
    // if(error){
    //     console.log("🚀 ~ registerUser ~ error:", error)
    //     return res.status(400).send({statusCode:400, message: error.message})

    // }

    //==========================
    console.log("=========>", req.body.fullName)
    console.log("files=====>", req.files)


    if ([fullName, email, username, password].some((field) => !field || field.trim() === "")
    ) {
        throw new ApiError(400, "fields are required");
    }

    let existedUser = await userModel.findOne({
        "$or": [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists.")
    }

    if (!req.files.avatar || req.files.avatar == null || req.files.avatar == undefined || req.files.avatar[0].length == 0) {
        throw new ApiError(400, "Avatar file is required.")
    }

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path  // coverImage is not required.
    }
    // return
    let avatarLocalPath = req.files?.avatar[0]?.path
    // let coverImageLocalPath = req.files?.coverImage[0]?.path

    const avatar = await uploadCloudinary(avatarLocalPath)
    const coverImage = await uploadCloudinary(coverImageLocalPath)

    console.log("==avatar===>", avatar)
    // console.log("avatar==>",avatar)
    // return
    if (!avatar) {
        throw new ApiError(400, "Avatar file is required.")
    }

    // if (!coverImage) {
    //     throw new ApiError(400, "Cover Image is required.")
    // }

    const userData = new userModel({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })
    // const user = await User.create({

    // })
    const saveUserData = await userData.save()
    // if(!saveUserData){
    //     throw new ApiError(400,"error while creating user.")
    // }
    // console.log("--user==>", user)

    const createdUser = await userModel.findById(saveUserData._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "something went wrong while registering user.")
    }
    res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully.")
    )
})



const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body

    if (!(username || email)) {
        throw new ApiError(400, "username or password is required")
    }

    const user = await userModel.findOne({
        $or: [{ username }, { email }]
    })
    if (!user) {
        throw new ApiError(404, "User does not exist.")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials.")
    }


    // const {accessTokens,refreshTokens}=await generateAccessAndRefreshTokens(user._id)
    const token = await generateAccessAndRefreshTokens(user._id)
    let accessToken = token.accessToken
    let refreshToken = token.refreshToken

    const loggedInUser = await userModel.findById(user._id).select("-password -refreshToken")

    // console.log("==access==>",result)
    // console.log("==loggedInUser==>",accessToken)
    // console.log("==refreshToken==>",refreshToken)
    // return

    // now we send cookies

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, {
                // user:accessTokens,
                user: loggedInUser, accessToken, refreshToken
                // token:accessTokens,
                // refreshToken: refreshTokens
            },
                "User logged In successfully."
            )
        )

})

const logOutUser = asyncHandler(async (req, res) => {
    console.log("====>", req.AUTH)
    // return
    const update = await userModel.findOneAndUpdate(
        req.AUTH._id,
        {
            $set: {
                refreshToken: undefined
            },
        },
        { new: true }
    )


    return res
        .status(200)
        .clearCookie("accesstoken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "user logged out successfully.")
        )
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    let incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized")
    }

   try {
     let decodedToken = jwt.verify(
         incomingRefreshToken,
         process.env.REFRESH_TOKEN_SECRET)
 
     const user = await userModel.findById(decodedToken?._id)
 
     if (!user) {
         throw new ApiError(401, "Invalid refresh token.")
     }
 
     if (incomingRefreshToken !== user?.refreshToken) {
         throw new ApiError(401, "Refresh token is expired or used.")
     }
 
     let options = {
         httpOnly: true,
         secure: true
     }
 
     //  token is validated successfully then
     //  we creating new refresh token 
 
     const token = await generateAccessAndRefreshTokens(user._id)
     let accessToken = token.accessToken
     let newRefreshToken = token.refreshToken
 
     return res
         .status(200)
         .cookie("accessToken",accessToken , options)
         .cookie("refreshToken",newRefreshToken , options)
         .json(
             new ApiResponse(
                 200,
                  {accessToken,
                     refreshToken:newRefreshToken}, 
                     "Access token refreshed.")
         )
   } catch (error) {
    throw new ApiError(401,error || "Invalid refresh token.")
   }
})


//  change password means user is logged in and want password change
const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const{oldPassword,newPassword}=req.body

    let user=await userModel.findById(req.AUTH?._id)

    let isPasswordCorrect= await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400,"Invalid old password.")
    }

    // set new password

    user.password=newPassword
     await user.save({validateBeforeSave:false})

     return res.status(200)
    .json(new ApiResponse(200,{},"Password changed successfully."))

})

const getCurrentuser= asyncHandler(async(req,res)=>{
   
    return res
    .status(200)
    .json(new ApiResponse(200,req.AUTH,"User fetch successfully."))
})

const updateAccountdetails= asyncHandler(async(req,res)=>{
    const{fullName,email} =req.body

    if(!fullName || !email){
        throw new ApiError(400,"All fields are required.")
    }

    let user= await userModel.findOneAndUpdate(
        req.AUTH?._id,
        {
            $set :{
                "fullName":fullName,
                "email":email
            }
        },
        {new:true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"Account details updated successfully."))
})

const updateUserAvatar = asyncHandler(async(req,res)=>{
        let avatarLocalPath=req.file?.path

        if(!avatarLocalPath){
            throw new ApiError(400,"Avatar file is missing.")
        }

        const avatar= await uploadCloudinary(avatarLocalPath)

        if(!avatar.url){
            throw new ApiError(400,"Error while uploading on avatar.")
        }

      let user=  await userModel.findByIdAndUpdate(
            req.AUTH?._id,
            {
                $set:{
                    avatar:avatar.url
                }
            }
            ,
            {new:true}
        ).select("-password")

        return res
        .status(200)
        .json(new ApiResponse(200,user,"User Cover Image updated successfully."))
})

const updateCoverImage = asyncHandler(async(req,res)=>{
    let coverImageLocalPath=req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400,"Avatar file is missing.")
    }

    const coverImage= await uploadCloudinary(coverImageLocalPath)

    if(!coverImage.url){
        throw new ApiError(400,"Error while uploading on avatar.")
    }

    const user=await userModel.findByIdAndUpdate(
        req.AUTH?._id,
        {
            $set:{
                coverImage:coverImage.url
            }
        }
        ,
        {new:true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"User Cover Image updated successfully."))
})

module.exports = {
    registerUser: registerUser,
    loginUser: loginUser,
    logOutUser: logOutUser,
    refreshAccessToken:refreshAccessToken,
    changeCurrentPassword:changeCurrentPassword,
    getCurrentuser:getCurrentuser,
    updateAccountdetails:updateAccountdetails,
    updateUserAvatar:updateUserAvatar,
    updateCoverImage:updateCoverImage
}