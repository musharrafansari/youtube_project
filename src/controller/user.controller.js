const { asyncHandler } = require("../utils/asyncHandler.js");
const { ApiError } = require("../utils/ApiError.js");
const { ApiResponse } = require("../utils/ApiResponse.js");
const mongoose = require("mongoose");
const { User } = require("../models/user.model.js"); // Adjust the import statement
const { uploadCloudinary } = require("../utils/cloudinary.js");
const userModel = require("../models/user.model.js");
const { required, options } = require("joi");
const { userSchema } = require("../validators/userSchema.js"); // Assuming it's userSchema, not userSchem

const generateAccessAndRefreshTokens = async function(userId) {
    try {

        let id=userId.toString()
        // return
        const user = await userModel.findById(id);
        const accessToken = await user.generateAccessToken();

        const refreshToken = await user.generateRefreshToken();
        // console.log("---refered",refreshToken)

        // return
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

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


    if ([fullName, email, username, password].some(  (field) => !field || field.trim() === "" )
    ) {
        throw new ApiError(400, "fields are required");
    }

    let existedUser =await  userModel.findOne({
        "$or": [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists.")
    }

    if (!req.files.avatar || req.files.avatar==null || req.files.avatar== undefined || req.files.avatar[0].length==0) {
        throw new ApiError(400, "Avatar file is required.")
    }

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalPath=req.files.coverImage[0].path  // coverImage is not required.
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

    const userData=new userModel({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })
    // const user = await User.create({
       
    // })
const saveUserData=await userData.save()
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
        new ApiResponse(200,createdUser,"User registered successfully.")
    )
})



const loginUser=asyncHandler(async(req,res)=>{
    const {email,username,password}=req.body

    if(!(username || email)){
        throw new ApiError(400,"username or password is required")
    }

   const user=await  userModel.findOne({
        $or:[{username},{email}]
    })
    if(!user){
        throw new ApiError(404,"User does not exist.")
    }

   const isPasswordValid= await user.isPasswordCorrect(password)
   if(!isPasswordValid){
    throw new ApiError(401,"Invalid user credentials.")
}


const {accessTokens,refreshTokens}=await generateAccessAndRefreshTokens(user._id)
const loggedInUser=await userModel.findById(user._id).select("-password -refreshToken")

// console.log("==access==>",result)
// console.log("==loggedInUser==>",loggedInUser)
// return
// now we send cookies

const options={
    httpOnly:true,
    secure:true
}

return res
.status(200)
.cookie("accessToken",accessTokens,options)
.cookie("refreshToken",refreshTokens,options)
.json(
    new ApiResponse(200,{
        user:loggedInUser,accessTokens, refreshTokens
    },
    "User logged In successfully."
    )
)

})

const logOutUser=asyncHandler(async(req,res)=>{
   const update= await userModel.findByIdAndUpdte(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            },
        },
        {new:true}
        )


return res
.status(200)
.clearCookie("accesstoken",options)
.clearCookie("refreshToken",options)
.json(
    new ApiResponse(200,{},"user logged out successfully.")
)
})


module.exports = {
    registerUser: registerUser,
    loginUser:loginUser,
    logOutUser:logOutUser
}