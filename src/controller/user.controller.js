const { asyncHandler } = require("../utils/asyncHandler.js")
const { ApiError } = require("../utils/ApiError.js")
const { User } = require("../models/user.model.js")
const { uploadCloudinary } = require("../utils/cloudinary.js")
const userModel = require("../models/user.model.js")
const { required } = require("joi")
const {userSchem} = require("../validators/userSchema.js")


const registerUser = asyncHandler(async (req, res) => {

    console.log("sssssss")

    const { fullName, email, username, password } = req.body
    const {error, value} = userSchem.validate(req.body)
    if(error){
        console.log("🚀 ~ registerUser ~ error:", error)
        return res.status(400).send({statusCode:400, message: error.message})
        
    }

    console.log("=========>", req.body.fullName)

    // return

    if ([fullName, email, username, password].some(  (field) => !field || field.trim() === "" )
    ) {
        // console.log(new ApiError(400, "All fields are required"),"=================================")
        throw new ApiError(400, "fields are required");
    }


    if (req.body.fullName === undefined || req.body.fullName === null) {
    throw new ApiError(400, "All fields are required");
}


    let existedUser = User.findOne({
        $or: [{ username }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists.")
    }

    // return
    let avatarLocalPath = req.files?.avatar[0]?.path
    let coverImageLocalPath = req.files?.coverImage[0]?.path

    // console.log("avatarLocalPath==>",avatarLocalPath)
    // return
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required.")
    }

    const avatar = await uploadCloudinary(avatarLocalPath)
    const coverImage = await uploadCloudinary(coverImageLocalPath)

    console.log("==avatar===>", avatar)
    // console.log("avatar==>",avatar)
    // return
    if (!avatar) {
        throw new ApiError(400, "Avatar file is required.")
    }

    if (!coverImage) {
        throw new ApiError(400, "Cover Image is required.")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    console.log("--user==>", user)

    const createdUser = await userModel.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "something went wrong while registering user.")
    }
    res.send({ createdUser })
})

// const registerUser=async function(req,res){
//     let result=asyncHandler(req,res)
//     res.status(200).json({message:"Ok"})
// }



module.exports = {
    registerUser: registerUser,
}