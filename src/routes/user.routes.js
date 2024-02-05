// import { Router } from "express";
const express=require("express")
const userController =require("../controller/user.controller.js")
const {upload}=require("../middlewares/multer.middleware.js")
const { verify } = require("jsonwebtoken")
const {verifyJWT}=require("../middlewares/auth.middleware.js")


const router=express.Router()

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ])  ,                              // may be single file or multiple file-fields
    userController.registerUser)   

// router.post("/register",upload.single('file'),registeruser.registerUser)


    router.route("/loginUser").post(userController.loginUser)
    router.route("/refreshAccessToken").post(userController.refreshAccessToken)  

    // secured routes

    router.route("/logOutUser").post(verifyJWT,userController.logOutUser)  // verifyJWT is middleware
    router.route("/getCurrentuser").get(verifyJWT,userController.getCurrentuser)  
    router.route("/changeCurrentPassword").put(verifyJWT,userController.changeCurrentPassword)  
    router.route("/updateAccountdetails").put(verifyJWT,userController.updateAccountdetails)  
    router.route("/updateUserAvatar").put(verifyJWT,userController.updateUserAvatar)  
    router.route("/updateCoverImage").put(verifyJWT,userController.updateCoverImage)  


module.exports = router