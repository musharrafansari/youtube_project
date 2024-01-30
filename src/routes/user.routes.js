// import { Router } from "express";
const express=require("express")
const {registerUser,loginUser, logOutUser} =require("../controller/user.controller.js")
const {upload}=require("../middlewares/multer.middleware.js")
const { verify } = require("jsonwebtoken")


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
    registerUser)   

    router.route("/loginUser").post(loginUser)

    // secured routes

    router.route("/logOutUser").post(verify,logOutUser)  // verify is middleware

// router.post("/register",upload.single('file'),registeruser.registerUser)

module.exports = router